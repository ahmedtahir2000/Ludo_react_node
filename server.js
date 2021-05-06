const fs = require(`fs`)
const http = require(`http`)
const WebSocket = require(`ws`)  // npm i ws


const readFile = (fileName) => 
  new Promise((resolve, reject) => {
    fs.readFile(fileName, (readErr, fileContents) => {
      if (readErr) {
        reject(readErr)
      } else {
        resolve(fileContents)
      }
    })
  })

  

const server = http.createServer(async (req, resp) => { //Creating Server
   
    if (req.url == `/mydoc`) {
        const clientHtml = await readFile(`client.html`)
        resp.end(clientHtml)
    } else if (req.url == `/myjs`) {
        const clientJs = await readFile(`client.js`)
        resp.end(clientJs)
    }
    else if(req.url == '/ludo.css'){
        const css = await readFile(`ludo.css`)
        resp.end(css)
    }else if(req.url == '/center.png'){
        const image= await readFile(`center.png`)
        resp.end(image)
    }else {
        console.log(`Not found ${req.url}`)
        resp.end(`Not found`)
    }
})



//New Ludo Board Array
const newBoardArray= [[['blue','blue','blue','blue'],[],[],[],[],[],[],[],[],[],[],[],[],[]
,['red','red','red','red']],[[],[],[],[],[],[],[],[],[],[],[],[],[],[]
,[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[]
,[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[
],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[
],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],
[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],
[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[]
,[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[]
,[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[
],[],[]],[['yellow','yellow','yellow','yellow'],[],[],[],[],[],[],[],[
],[],[],[],[],[],['green','green','green','green']]]




let updateBoard={
  type:`newboard`,
  board:newBoardArray
}

//Step function to get new coordinate after movement
const step = (color, ox, oy, steps) => {

  const transform = ([ox,oy]) => ({'blue': [+ox,+oy], 'green': [-ox,-oy], 'red': [-oy,+ox], 'yellow': [+oy,-ox]}[color])
  const path = ['-7,-7', '-1,-6', '-1,-5', '-1,-4', '-1,-3', '-1,-2', '-2,-1', '-3,-1', '-4,-1', '-5,-1', '-6,-1', '-7,-1', '-7,0', '-7,1', '-6,1', '-5,1', '-4,1', '-3,1', '-2,1', '-1,2', '-1,3', '-1,4', '-1,5', '-1,6', '-1,7', '0,7', '1,7', '1,6', '1,5', '1,4', '1,3', '1,2', '2,1', '3,1', '4,1', '5,1', '6,1', '7,1', '7,0', '7,-1', '6,-1', '5,-1', '4,-1', '3,-1', '2,-1', '1,-2', '1,-3', '1,-4', '1,-5','1,-6', '1,-7', '0,-7', '0,-6', '0,-5', '0,-4', '0,-3', '0,-2', '0,-1']
  const [x,y] = transform(transform(transform(path[path.indexOf(transform([ox-7, oy-7]).join(','))+steps].split(','))))

  return [x+7,y+7]
 }

 //Check if move available specially incase of winning position
 const checkMove = (x, y, dice) => {   
   if((x == 7 && y == 1) || (x == 1 && y == 7) || (x == 7 && y == 13) || (x == 13 && y == 7)){
      if(dice < 6){
        return true
      }else{
        return false
      }
   }else if((x == 7 && y == 2) || (x == 2 && y == 7) || (x == 7 && y == 12) || (x == 12 && y == 7)){
    if(dice < 5){
      return true
    }else{
      return false
    }
   }else if((x == 7 && y == 3) || (x == 3 && y == 7) || (x == 7 && y == 11) || (x == 11 && y == 7)){
    if(dice < 4){
      return true
    }else{
      return false
    }
  }else if((x == 7 && y == 4) || (x == 4 && y == 7) || (x == 7 && y == 10) || (x == 10 && y == 7)){
    if(dice < 3){
      return true
    }else{
      return false
    }
  }else if((x == 7 && y == 5) || (x == 5 && y == 7) || (x == 7 && y == 9) || (x == 9 && y == 7)){
    if(dice < 2){
      return true
    }else{
      return false
    }
  }else{
    return true
  }

 }
 let win = ""
 //Check if any color wins
 const checkWin = (brd, x, y) => {
  if((x == 7 && y == 6) || (x == 7 && y == 8) || (x == 6 && y == 7) || (x == 8 && y == 7)){
      if(brd[x][y].length == 4){
        return true
      }
      return false
    }else{
      return false
    }
 }

 //Check if a piece can kill another piece of different color and depend on position
 const kill = (brd, x, y, clr) =>{
   if((x == 6 && y == 1) || (x == 2 && y == 6) || (x == 1 && y == 8) || (x == 6 && y == 12) || (x == 8 && y == 13) || (x == 12 && y == 8) || (x == 13 && y == 6) || (x == 8 && y == 2)  ){
      return(brd)
   }else{
     
     const post = brd
     post[x][y].forEach((val) => {
      if(val != clr){
        const idx = post[x][y].indexOf(val)
        if(post[x][y][idx] == "blue"){
          brd[x][y].splice(idx,1)
          brd[0][0][brd[0][0].length] =val
          
        }else if(post[x][y][idx] == "red"){
          brd[x][y].splice(idx,1)
          brd[0][14][brd[0][14].length] =val
          
        }
        else if(post[x][y][idx] == "green"){
          brd[x][y].splice(idx,1)
          brd[14][14][brd[14][14].length] =val
          
        }
        else if(post[x][y][idx] == "yellow"){
          brd[x][y].splice(idx,1)
          brd[14][0][brd[14][0].length] =val
          
        }
        

      }

     })
   }
   
   return(brd)
   
 }



//update board after every movement
const updatedBoard = (brd, x, y, clr, dice) => {

  const iskilled = (ox, oy) => (ox-7)*(ox-7)+(oy-7)*(oy-7) == 98
  const idx = brd[x][y].indexOf(clr)
  let sp;
  if(checkMove(x, y, dice)==true){
    if(iskilled(x,y)==true){
      if(dice == 6){
        sp = step(clr, x, y, 1)
      }else{
        sp = step(clr, x, y, 0)
      }

    }else{
      sp = step(clr, x, y, dice)
    }
    
      brd[x][y].splice(idx,1)
      x = sp[0]
      y = sp[1]
 
      brd[x][y][brd[x][y].length] =clr
      brd = kill(brd, x, y, clr)
      if(checkWin(brd, x, y) == true){
        win = clr
      }
  }
  return(brd)
}


let turn = "blue turn"
let count = 0 
server.listen(8000)
console.log("server is listening")
const wss = new WebSocket.Server({ port: 8080 })

wss.on(`connection`, (ws) => {
  let pass = 0
  let ludoBoard={
    type:`newboard`,
    board:newBoardArray,
    trn: turn
  }
  
  let dice = Math.floor(Math.random()*6)+1
  dice = 6;
  let color = ""
  console.log(`A user connected`)
  ws.on(`message`, (message) => {
    let serv_message = {
      type: "server_message",
      msg:""
    }
    if(turn != `${color} turn`){
      serv_message.msg = `It is not your turn, It is ${turn}`
      ws.send(JSON.stringify(serv_message))
    }else{

    const clientMessage = JSON.parse(message)
  
    if(clientMessage.type=="spriteDetail"){

      const iskilled = (ox, oy) => (ox-7)*(ox-7)+(oy-7)*(oy-7) == 98

      if(dice != 6 && iskilled(clientMessage.x_cd, clientMessage.y_cd) == true && updateBoard.board[clientMessage.x_cd][clientMessage.y_cd].length < 4 && pass == 0){
        serv_message.msg = `Select another opened piece, This is Locked`
        ws.send(JSON.stringify(serv_message))
      }else if((clientMessage.x_cd == 7 && clientMessage.y_cd == 6) || (clientMessage.x_cd == 7 && clientMessage.y_cd == 8) || (clientMessage.x_cd == 6 && clientMessage.y_cd == 7) || (clientMessage.x_cd == 8 && clientMessage.y_cd == 7)){
        pass++
        serv_message.msg = `Select another opened piece, This is done!!`
        ws.send(JSON.stringify(serv_message))
      }else{
        switch (turn) {
          case "blue turn":
            turn = "red turn"
            break;
          case "red turn":
            turn = "green turn"
            break;
          case "green turn":
            turn = "yellow turn"
            break;
          case "yellow turn":
            turn = "blue turn"
            break;
          default:
            break;
        }
        updateBoard={
          type:`newboard`,
          board:updatedBoard(updateBoard.board, clientMessage.x_cd, clientMessage.y_cd, clientMessage.color, dice),
          trn: turn
        }

        if(win != ""){
          updateBoard.trn = `${win} Wins!!`
        }
        
        dice = Math.floor(Math.random()*6)+1

        ws.send(JSON.stringify(
          {
            type: "dice",
            value: dice
          }
        ))
           
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(updateBoard))
          if(win!=""){
            client.send(JSON.stringify({type: "CloseConnection"}))
            client.close()
          }
        }
      })

    
    }
      
    }
  }
  })
  
  if(count == 0){
    color = 'blue'
  }else if(count == 1){
    color = 'red'
  }else if(count == 2){
    color = 'green'
  }else if(count == 3){
    color = 'yellow'
  }

  ws.send(JSON.stringify(
    {
      type: "dice",
      value: dice
    }
  ))
  ws.send(JSON.stringify(
    {
      type: "piece",
      class: color
    }
  ))
  
  count++
  const playerConnected = {
    type: "player_connected",
    p_count: count
  }
  
  
  if(count == 4){
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(ludoBoard))
      }
    })
  }else{
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(playerConnected))
      }
    })
}
  

})