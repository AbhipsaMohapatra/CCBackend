const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
// const { all } = require("../routes/messageRoutes");

// const sendMessage = asyncHandler( async (req,res)=>{
//     const {content,chatId} = req.body;

//     if(!content || !chatId){
//         console.log("Invalid data passed into request");
//         return res.sendStatus(400);

//     }
//     var newMessage = {
//         sender : req.user._id,
//         content : content,
//         chat :chatId,
//     };
//     try {
//         var message = await Message.create(newMessage);
//         message = await message.populate("sender","name pic");
//         message = await message.populate("chat");
//         message = await User.populate(message,{
//             path:'chat.users',
//             select:"name pic email",
//         })

//         await Chat.findByIdAndUpdate(req.body.chatId,{
//             latestMessage:message,
//         });
//         res.json(message);

//     } catch (error) {
//         res.status(400);
//         throw new Error(error.message);
        
//     }


// });

// const allMessages = asyncHandler( async(req,res)=>{
//     try {
//         const messages = await Message.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat");
//         res.json(messages);
//     } catch (error) {
//         res.status(400);
//         throw new Error(error.message);
//     }

// })


const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    try {
        var newMessage = {
            sender: req.user._id, // ✅ Ensure sender is set from authenticated user
            content: content,
            chat: chatId,
        };

        var message = await Message.create(newMessage);

        // ✅ Populate sender correctly
        message = await message.populate("sender", "name pic email");
        message = await message.populate({
            path: "chat",
            populate: {
                path: "users",
                select: "name pic email",
            },
        });

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});



const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")  // ✅ Ensure sender is populated
            .populate({
                path: "chat",
                populate: {
                    path: "users",
                    select: "name pic email",
                },
            });

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


module.exports = {sendMessage,allMessages}