const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = graphql;
const { UserInputError } = require("apollo-server");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const Song = require("../models/song");
const Artist = require("../models/artist");
const User = require("../models/user");
const checkAuth = require("../utils/checkAth");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utils/validation");
const { generateToken } = require("../utils/generateToken");

const userType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    token: { type: GraphQLString },
    songs: {
      type: new GraphQLList(songType),
      resolve(parent, arg) {
        return Song.find({ userName: parent.username });
      },
    },
  }),
});
// const artists = [
//   { name: "Queen", id: "1" },
//   { name: "George Michael", id: "2" },
//   { name: "Taylor Swift", id: "3" },
// ];

const songType = new GraphQLObjectType({
  name: "Song",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    artist: { type: GraphQLString },
    date: { type: GraphQLInt },
    artistId: { type: GraphQLID },
    userName: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    artist: {
      type: artistType,
      resolve(parent, arg) {
        return Artist.findById(parent.artistId);
      },
    },
    user: {
      type: new GraphQLList(userType),
      resolve(parent, arg) {
        return User.find({ username: parent.userName });
      },
    },
  }),
});

const artistType = new GraphQLObjectType({
  name: "Artist",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    bio: { type: GraphQLString },
    songs: {
      type: new GraphQLList(songType),
      resolve(parent, arg) {
        //return _.filter(songs, { artistId: parent.id });
        return Song.find({ artistId: parent.id });
      },
    },
  }),
});
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    song: {
      type: songType,
      args: { id: { type: GraphQLID } },
      resolve(parent, arg) {
        return Song.findById(arg.id);
      },
    },
    findSongByName: {
      type: new GraphQLList(songType),
      args: { title: { type: GraphQLString } },
      resolve(parent, arg) {
        return Song.findOne({ title: arg.title });
      },
    },
    findSongByUser: {
      type: new GraphQLList(songType),
      args: { userName: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parent, arg) {
        return Song.find({ userName: arg.userName });
      },
    },
    artist: {
      type: artistType,
      args: { id: { type: GraphQLID } },
      resolve(parent, arg) {
        return Artist.findById(arg.id).sort({ name: 1 });
      },
    },
    songs: {
      type: new GraphQLList(songType),
      resolve(parent, arg) {
        return (songs = Song.find({}).sort({ title: 1 }));
      },
    },
    artists: {
      type: new GraphQLList(artistType),
      resolve(parent, arg) {
        return Artist.find({});
      },
    },
    users: {
      type: new GraphQLList(userType),
      resolve(parent, arg) {
        return User.find({});
      },
    },
    user: {
      type: new GraphQLList(userType),
      args: { username: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(_, arg) {
        return User.find({ username: arg.username });
      },
    },
    // return User.findOne({ username: username })
    // .populate('posts').exec((err, posts) => {
    //   console.log("Populated User " + posts);
    // })
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    register: {
      type: userType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const user = await User.findOne({ username: args.username });
        if (user) {
          throw new UserInputError("Username is taken", {
            errors: { username: "This username is taken" },
          });
        }
        const { valid, errors } = validateRegisterInput(
          args.username,
          args.password,
          args.confirmPassword
        );
        if (!valid) throw new UserInputError("Error", { errors });
        const EncryptedPassword = await bcrypt.hash(args.password, 12);
        const newUser = new User({
          username: args.username,
          password: EncryptedPassword,
        });
        const res = await newUser.save();
        const token = generateToken(res);
        return { ...res._doc, username: res.username, id: res._id, token };
      },
    },
    login: {
      type: userType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args) {
        const { valid, errors } = validateLoginInput(
          args.username,
          args.password
        );
        if (!valid) throw new UserInputError("Wrong credentials", { errors });
        const user = await User.findOne({ username: args.username });
        if (!user) {
          errors.general = "User not found";
          throw new UserInputError("User not found", { errors });
        }
        const match = await bcrypt.compare(args.password, user.password);
        if (!match) {
          errors.general = "Wrong credentials";
          throw new UserInputError("Wrong credentials", { errors });
        }
        const token = generateToken(user);
        return {
          ...user._doc,
          username: user.username,
          id: user._id,
          token,
        };
      },
    },
    addArtist: {
      type: artistType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        bio: { type: GraphQLString },
      },
      resolve(parent, args) {
        let artist = new Artist({ name: args.name, bio: args.bio });
        return artist.save();
      },
    },
    addSong: {
      type: songType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        date: { type: new GraphQLNonNull(GraphQLInt) },
        artistId: { type: new GraphQLNonNull(GraphQLID) },
        createdAt: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        const user = await checkAuth(context);
        const song = new Song({
          title: args.title,
          date: args.date,
          artistId: args.artistId,
          userName: user.username,
          createdAt: new Date().toISOString(),
          // user: user.id,
        });
        return song.save();
      },
    },
    deleteSong: {
      type: songType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Song.findByIdAndRemove(args.id);
      },
    },
    updateSong: {
      type: songType,
      args: {
        id: { type: GraphQLID },
        title: { type: new GraphQLNonNull(GraphQLString) },
        date: { type: GraphQLInt },
      },
      resolve(parent, args) {
        return Song.findByIdAndUpdate(
          args.id,
          {
            title: args.title,
            date: args.date,
          },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log(data);
            }
          }
        );
      },
    },
  },
});

module.exports = new GraphQLSchema({ query: RootQuery, mutation: Mutation });
