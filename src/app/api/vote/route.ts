import { voteCollection, db, questionCollection, answerCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        // 1. Grab data
        const { votedById, voteStatus, type, typeId } = await request.json();

        // 2. Check for an existing vote by this user
        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
        ]);

        // Declare doc up here so the return statement at the bottom can always see it!
        let doc = null; 

        // 3. If a previous vote exists, DELETE IT and reverse the reputation
        if (response.documents.length > 0) {
            await databases.deleteDocument(db, voteCollection, response.documents[0].$id);

            const questionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);
            await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                reputation:
                    // Fixed typo: votestatus -> voteStatus
                    response.documents[0].voteStatus === "upvoted"
                        ? Number(authorPrefs.reputation) - 1
                        : Number(authorPrefs.reputation) + 1,
            });
        }

        // 4. If this is a brand new vote, OR if they are switching from up to down (or vice versa), create the new vote!
        if (response.documents[0]?.voteStatus !== voteStatus) {
            doc = await databases.createDocument(db, voteCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById,
            });

            const questionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);
            await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                reputation:
                    voteStatus === "upvoted"
                        ? Number(authorPrefs.reputation) + 1
                        : Number(authorPrefs.reputation) - 1,
            });
        }

        // 5. Calculate the true total votes for the post (Removed the votedById filter!)
        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.limit(1), 
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.limit(1),
            ]),
        ]);

        return NextResponse.json(
            {
                data: { document: doc, voteResult: upvotes.total - downvotes.total },
                message: response.documents[0] ? "Vote Status Updated" : "Voted",
            },
            {
                status: 201,
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Error handling vote" },
            { status: error?.status || error?.code || 500 }
        );
    }
}