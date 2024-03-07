import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetPayload{
    content: string
    imageURL?: string
}

const queries = {
    getAllTweets: async () => {
        const allTweets = await prismaClient.tweet.findMany({
            orderBy: {createdAt: 'desc'}
        })
        return allTweets;
    }
}

const mutations = {
    createTweet: async (
        parent: any, 
        {payload}:{payload: CreateTweetPayload}, 
        ctx : GraphqlContext
    ) => {
        if(!ctx.user) throw Error("You are not authenticated");

        const tweet = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL,
                author: {connect: {id : ctx.user.id}}
            }
        });

        return tweet;
    }
}

const extraResolvers = {
    Tweet: {
        author: async (parent: Tweet) => {
            const user = await prismaClient.user.findUnique({where: {id: parent.authorId}})

            return user;
        }
    }
}

export const resolvers = {mutations, extraResolvers, queries};