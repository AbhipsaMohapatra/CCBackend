
# Chat&Code

Our website is a collaborative platform that allows users to connect through real-time chat while also providing an integrated code editor for seamless collaborative coding. It enables both one-on-one and group communication, making it ideal for developers, teams, and coding enthusiasts to discuss, share, and build projects together in real time.



## Documentation

First clone this github repository then go to VS code.  
To start , open 2 terminals.  
In one terminal, write npm install then write npm start,    
and in other terminal , go to frontend folder and then write npm install then npm run dev.  
Then ctrl+click on the frontend link. Now your website is ready to use.


## API Reference

#### Login

```http
 post request
 http://localhost:5000/api/user/login 
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email & password` | `string` | **Required**.  |

#### Sign Up

```http
   post request
  "/api/user"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Name, email, password, pic`      | `string` | **Required**.  |

#### Fetching Chats

```http
   get request
  "http://localhost:5000/api/chat"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
|      | `string` | It is used to fetch the chats|

#### To get single chat
```http
   get request
  "http://localhost:5000/api/message/${selectedChat._id}"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
|      | `string` | It is used to fetch the chats|


#### To search user
```http
   get request
  "http://localhost:5000/api/user?search=${query}"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
|   search=${query}   | `string` | It is used to search user|

#### Add member to group
```http
   put request
  "http://localhost:5000/api/chat/groupadd"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
|   chat_Id, user_Id   | `string` |Add|

#### Remove member from group
```http
   put request
  "http://localhost:5000/api/chat/groupremove"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
|   chat_Id, user_Id   | `string` |Remove|

#### Rename Group
```http
   put request
  "http://localhost:5000/api/chat/rename"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
|   chat_Id, chat_Name   | `string` |Rename|






## TechStack

Frontend: React,Chakra UI    
Backend: MongoDB, Express, Nodejs, Socket io, Monaco code Editor
## Acknowledgements

 - [Readme](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
 - [Github](https://github.com)
 - [API-Piston](https://piston.readthedocs.io/en/latest/api-v2/)


## Team Members

Abhipsa Mohapatra,CSE 2nd year   
Anwesha Bal,CSE 2nd year  
Debasmita Panda,CSE 2nd year
