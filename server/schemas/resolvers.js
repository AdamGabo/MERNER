//responsible for popupalating data, boilerplate from Module, uses Mongoose models 

const { User} = require('../models'); //User will house all the elements needed for the resolvers to populate items 
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
              return userData;
            }
            throw new AuthenticationError('Not logged in');
          }
    },
    Mutation: {
      //BoilerPlate
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
          },
          saveBook : async (parent, { input }, context) => { //i for input, look up apollo docs on input
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(  // pass in the user and find one and update an element, then utilize addtoSet like push but no duplicated possible 
                { _id: context.user._id }, { $addToSet: {savedBooks: input} }, { new: true, runValidators: true } );
              return updatedUser;
            }
          
            throw new AuthenticationError('You need to be logged in!');
          },
          //BoilerPlate 
          login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
              throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
          },
          removeBook: async (parent, { bookId  }, context) => { //pass in book ID, 
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id }, { $pull: { savedBooks: { bookId : bookId  } } }, { new: true });
              return updatedUser;
            }
            throw new AuthenticationError("You need to be logged in!");
          }
    }
      
  };
  
  module.exports = resolvers;