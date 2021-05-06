const ws = new WebSocket(`ws://localhost:8080`)



const InitBoard = () =>{
    const [color_decided, setColor] = React.useState()
    const [turn, setTurn] = React.useState("")
    const [player_connected, setPlayerConnected] = React.useState()
    const [win, setWin] = React.useState("")
    
    const selectedSprite= (clr, x, y) =>{   //Function to send sprite Details
      
        const spriteDetail={
            type: `spriteDetail`,
            color: clr,
            x_cd: x,
            y_cd: y
        }
      
        if(ws.readyState === WebSocket.OPEN){
            ws.send(JSON.stringify(spriteDetail))
        }else{
            setTurn(`${turn} Game Ended`)
        }
    
    }
    let check = 0

    const pieceUpdate = (d, x=0, y=0) => { // Update pieces in cell and return HTML 
     
        let list=[]
        d.forEach(val => {
    
            if(val == color_decided && win == ""){
                list.push( <div onClick={()=>selectedSprite(val, x, y)} key={check} className={val}></div>)
            }else{
                list.push( <div key={check} className={val}></div>)
            }
            check++
        });
        return list
    } 
    
    const htmlUpdate =(x,b) =>  { //make cells
    
        let list=[]
        
            for (let index = 0; index < 15; index++) {
                list.push( <div className={`cell${x}${index}`} key={index}>{pieceUpdate(b[x][index], x, index)}
                </div>)
            }
        return (<div>{list}</div>)
    }
    
    const Ludo=(b, dice) => { // A collective function for Dynamic Ludo 
        if(b.length==0){
            return (<h2>Required 4 people! Only {player_connected} connected, you are {color_decided}</h2>)
        }

        return(
            <div>
                {htmlUpdate(0,b)}
                {htmlUpdate(1,b)}
                {htmlUpdate(2,b)}
                {htmlUpdate(3,b)}
                {htmlUpdate(4,b)}
                {htmlUpdate(5,b)}
                {htmlUpdate(6,b)}
                {htmlUpdate(7,b)}
                {htmlUpdate(8,b)}
                {htmlUpdate(9,b)}
                {htmlUpdate(10,b)}
                {htmlUpdate(11,b)}
                {htmlUpdate(12,b)}
                {htmlUpdate(13,b)}
                {htmlUpdate(14,b)}
                <div className="dice">{dice}</div>  
                <div className={`color ${color_decided}`}></div>
                <div className = "text_box"><b>:</b> {turn} </div>
    
                
            </div>
                
                
            
        )
    }

    const [board, setBoard] = React.useState([])  // Keep board state
    const [dice, setDice] = React.useState()
   
    ws.onmessage = (event) => {

            const clientMessage = JSON.parse(event.data)
        
            if (clientMessage.type === `newboard`) { //New Board from server
                setBoard(clientMessage.board)
                setTurn(`${clientMessage.trn}`)
                if(turn.indexOf("Wins")!== -1){
                    console.log(win)
                    setWin(turn)
                }
            }
            if (clientMessage.type === `dice`) { //Dice value from server 
                setDice(clientMessage.value)
            }
            if (clientMessage.type === `piece`) { //Piece detail with color from server 
                setColor(clientMessage.class)
            }
            if (clientMessage.type === `server_message`) { //Any error Message
                setTurn(`${clientMessage.msg}`)
                if(turn.indexOf("Wins")!== -1){
                    console.log(win)
                    setWin(turn)
                }
            }
            if (clientMessage.type === `player_connected`) { //Details of connected player
                setPlayerConnected(clientMessage.p_count)
            }
            
        
        

    }
    return (Ludo(board, dice))
}



ReactDOM.render(<InitBoard />,document.querySelector(`#root`)) //Render Ludo in root
