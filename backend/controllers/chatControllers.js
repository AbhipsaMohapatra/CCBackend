const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
// const chats = require('../data/data');
// const { application } = require('express');
const User = require('../models/userModel')


const accessChat = asyncHandler( async(req,res)=>{
    const { userId } = req.body;

    if(!userId){
        console.log("UserId param not send with request");
        return res.sendStatus(400);

    }
     // Here as and is used so both the above conditions should be datisfied that is the user id of request and the user id saved
    //  console.log("🟢 User making request (req.user._id):", req.user._id);
    // console.log("🟢 Requested userId:", userId);
    var isChat = await Chat.find({
        isGroupChat:false,
        $and : [
            {users:{$elemMatch:{$eq : req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}},
        ]
        // users: { $all: [req.user._id, userId] }
       

    }).populate("users","-password").populate("latestMessage");

    isChat = await User.populate(isChat,{
        path:"latestMessage.sender",
        select:"name pic email",
    });

    if(isChat.length>0){
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            chatName : "sender",
            isGroupChat:false,
            users:[req.user._id,userId],
        };
        try {
            const createChat = await Chat.create(chatData);

            // const FullChat = await Chat.findOne({_id:createChat._id}).populate("users","-password");
            const FullChat = await Chat.findById(createChat._id)
            .populate("users", "-password");

            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
            
        }
    }

})

const fetchChats = asyncHandler( async(req,res)=>{
    try{
        Chat.find({ users : {$elemMatch :{ $eq: req.user._id}}}).populate("users","-password").populate("groupAdmin","-password").populate("latestMessage").sort({updatedAt:-1}).then(async(results)=>{
            results=await User.populate(results,{
                path:"latestMessage.sender",
                select:"name pic email",
            });

            res.status(200).send(results);
        })
    }
    catch(err){
        res.status(400);
        throw new Error(err.message);
    }

})

const createGroupChat = asyncHandler( async(req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message:"Please fill all the feilds"})
    }
    var users = JSON.parse(req.body.users);

    if(users.length<2){
      return res.status(400).send("More than 2 users are required for group chat");  
    }

    users.push(req.user);
    try{
        const groupChat = await Chat.create({
            chatName : req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user,

        });

        const fullGroupChat = await Chat.findOne({_id:groupChat._id}).populate("users","-password").populate("groupAdmin","-password");

        res.status(200).json(fullGroupChat);
    }
    catch(error){
        res.status(400);
        throw new Error(error.message);

    }

})

const renameGroup = asyncHandler( async (req,res)=>{
    const {chatId,chatName} = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(chatId,{chatName},{new:true}).populate("users","-password").populate("groupAdmin","-password");

    if(!updatedChat){
        res.status(404);
        throw new Error("Chat not found");
    }
    else{
        res.json(updatedChat);
    }
})

const addToGroup = asyncHandler(async (req,res)=>{
    const {chatId , userId} = req.body;

    const added = await Chat.findByIdAndUpdate(chatId,{$push:{users:userId}},{new:true}).populate("users","-password").populate("groupAdmin","-password");

    if(!added){
        res.status(404);
        throw new Error("Chat not found");

    }
    else{
        res.json(added);
    }
})

const removeFromGroup= asyncHandler(async (req,res)=>{
    const {chatId , userId} = req.body;

    const removed = await Chat.findByIdAndUpdate(chatId,{$pull:{users:userId}},{new:true}).populate("users","-password").populate("groupAdmin","-password");

    if(!removed){
        res.status(404);
        throw new Error("Chat not found");

    }
    else{
        res.json(removed);
    }
})

module.exports = {accessChat , fetchChats ,createGroupChat , renameGroup , addToGroup , removeFromGroup}