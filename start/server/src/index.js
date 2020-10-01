const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils')
const resolvers = require('./resolvers')
const LaunchAPI = require('./datasources/launch')
const UserAPI = require('./datasources/user')
const isEmail = require('isemail');
const dotenv = require('dotenv')
const store = createStore()
const result = dotenv.config()

const server = new ApolloServer({
    typeDefs ,
    resolvers,
    dataSources: () => (
        {
            launchAPI: new LaunchAPI(),
            userAPI: new UserAPI({store}),
        }
    ),
    context: async ({ req }) => {
        // simple auth check on every request
        const auth = req.headers && req.headers.authorization || '';
        const email = Buffer.from(auth, 'base64').toString('ascii');
        if (!isEmail.validate(email)) return { toto: "titi", user: null };
        // find a user by their email
        const users = await store.users.findOrCreate({ where: { email } });
        const user = users && users[0] || null;
        return { toto: "titi", user: { ...user.dataValues } };
    },
}
);

server.listen({port:process.env.PORT}).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});

