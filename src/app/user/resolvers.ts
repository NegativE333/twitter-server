import { prismaClient } from '../../client/db';
import { GraphqlContext } from '../../interfaces';
import { User } from '@prisma/client';
import UserService from '../../services/user';

const queries = {
    verifyGoogleToken: async(parent : any, {token}: {token: string}) => {
        const resultToken = await UserService.verifyGoogleAuthToken(token);
        return resultToken;
    },

    getCurrentUser: async(parent: any, args: any, ctx: GraphqlContext) => {
        
        const id = ctx.user?.id
        if(!id) return null;

        const user = await UserService.getUserById(id);

        return user;
    },

    getUserById: async(parent: any, {id}: {id: string}, ctx: GraphqlContext) => {
        
        const user = UserService.getUserById(id);
        
        return user;
    }
}

const extraResolvers = {
    User: {
        tweets: async (parent: User) => {
            const tweets = await prismaClient.tweet.findMany({ 
                where : {
                    authorId: parent.id
                }
            })

            return tweets;
        }
    }
}

export const resolvers = {queries, extraResolvers};