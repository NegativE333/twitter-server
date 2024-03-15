export const types = `#graphql
    scalar Date

    type User{
        id: ID!
        firstName: String!
        lastName: String
        email: String!
        profileImageURL: String
        createdAt: Date

        followers: [User]
        following: [User]

        recommendedUsers: [User]

        tweets: [Tweet]
    }

`;