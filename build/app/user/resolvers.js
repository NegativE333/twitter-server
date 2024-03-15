"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../client/db");
const user_1 = __importDefault(require("../../services/user"));
const queries = {
    verifyGoogleToken: (parent, { token }) => __awaiter(void 0, void 0, void 0, function* () {
        const resultToken = yield user_1.default.verifyGoogleAuthToken(token);
        return resultToken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return null;
        const user = yield user_1.default.getUserById(id);
        return user;
    }),
    getUserById: (parent, { id }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = user_1.default.getUserById(id);
        return user;
    })
};
const extraResolvers = {
    User: {
        tweets: (parent) => db_1.prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
        followers: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.prismaClient.follows.findMany({
                where: { follwing: { id: parent.id } },
                include: {
                    follower: true,
                },
            });
            return result.map((el) => el.follower);
        }),
        following: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: {
                    follwing: true,
                },
            });
            return result.map((el) => el.follwing);
        }),
        recommendedUsers: (parent, _, ctx) => __awaiter(void 0, void 0, void 0, function* () {
            if (!ctx.user)
                return [];
            const myFollowing = yield db_1.prismaClient.follows.findMany({
                where: {
                    follower: { id: ctx.user.id },
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
            const users = [];
            for (const followings of myFollowing) {
                for (const followingOfFollowedUser of followings.follwing.followers) {
                    if (followingOfFollowedUser.follwing.id !== ctx.user.id &&
                        myFollowing.findIndex(e => (e === null || e === void 0 ? void 0 : e.followingId) === followingOfFollowedUser.follwing.id) < 0) {
                        users.push(followingOfFollowedUser.follwing);
                    }
                }
            }
            return users;
        }),
    }
};
const mutations = {
    followUser: (parent, { to }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user || !ctx.user.id)
            throw new Error('Unauthenticated');
        yield user_1.default.followUser(ctx.user.id, to);
        return true;
    }),
    unfollowUser: (parent, { to }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user || !ctx.user.id)
            throw new Error('Unauthenticated');
        yield user_1.default.unFollowUser(ctx.user.id, to);
        return true;
    })
};
exports.resolvers = { queries, extraResolvers, mutations };
