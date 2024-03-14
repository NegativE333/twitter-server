import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";



const queries = {
    getAllTweets: async () => {
        const allTweets = TweetService.getAllTweets();
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

        const tweet = await TweetService.createTweet({
            ...payload,
            userId: ctx.user.id
        });

        return tweet;
    }
}

const extraResolvers = {
    Tweet: {
        author: async (parent: Tweet) => {
            const user = await UserService.getUserById(parent.authorId);

            return user;
        }
    }
}

export const resolvers = {mutations, extraResolvers, queries};