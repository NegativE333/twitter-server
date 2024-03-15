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
        tweets: (parent: User) => prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
        followers: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { follwing: { id: parent.id } },
                include: {
                    follower: true,
                },
            });
            return result.map((el) => el.follower);
        },
        following: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: {
                    follwing: true,
                },
            });
            return result.map((el) => el.follwing);
        },
        recommendedUsers: async(parent: User, _: any, ctx: GraphqlContext) => {
            if(!ctx.user) return [];
            const myFollowing = await prismaClient.follows.findMany({
                where: {
                    follower: { id : ctx.user.id },
                },
                include: {
                    follwing: {
                        include: {
                            followers: {
                                include: {
                                    follwing: true
                                }
                            }
                        }
                    }
                }
            });

            const users: User[] = []

            for (const followings of myFollowing){
                for(const followingOfFollowedUser of followings.follwing.followers){
                    if(
                        followingOfFollowedUser.follwing.id !== ctx.user.id &&
                        myFollowing.findIndex(e => e?.followingId === followingOfFollowedUser.follwing.id) < 0
                    ){
                        users.push(followingOfFollowedUser.follwing)
                    }
                }
            }
            return users;
        },
    }
}

const mutations = {
    followUser: async (
        parent: any, 
        {to}:{to: string}, 
        ctx: GraphqlContext
    ) => {
        if(!ctx.user || !ctx.user.id) throw new Error('Unauthenticated');
        await UserService.followUser(ctx.user.id, to);
        return true;
    },
    unfollowUser: async (
        parent: any, 
        {to}:{to: string}, 
        ctx: GraphqlContext
    ) => {
        if(!ctx.user || !ctx.user.id) throw new Error('Unauthenticated');
        await UserService.unFollowUser(ctx.user.id, to);
        return true;
    }
};

export const resolvers = {queries, extraResolvers, mutations};