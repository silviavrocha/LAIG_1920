/**
 * MyGameOrchestrator
 */
class MyGameOrchestrator extends CGFobject {
	constructor(scene) {
        super(scene);
        this.gameSequence = new MyGameSequence(scene);
        this.animator = new MyAnimator(scene, this);
        this.gameboard = new MyGameboard(scene);

        // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
	    // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
	    var filename=getUrlVars()['file'] || "lxs.xml";
        // create and load graph, and associate it to scene. 
        // Check console for loading errors
        this.theme = new MySceneGraph(filename, scene);

        this.prolog = new MyPrologInterface(scene);
        
        this.state = "start";
        this.scene.setPickEnabled(false);
        this.currentPlayer=1;
        this.level=1;
        this.number_passes=0;
        this.moveToExecute = [];
        // index 0 for player1 and index 1 for player 2. false is human, true is pc
        this.player=[false, false];

        //buttons for game
        this.undoButton = new MyButton(scene, "button2", "undo");
        this.exitButton = new MyButton(scene, "button2", "exit");
        this.movieButton = new MyButton(scene, "button2", "movie");
        this.confirmButton = new MyButton(scene, "button1", "confirm");
        this.removeButton = new MyButton(scene, "button1", "remove");

    }

    update(time) {
        this.animator.update(time);
    }

    menu(){
        this.state="pick first tile human";

    }

    renderMove(){
        let moveReply = this.prolog.response;
        this.prolog.response = null

        let destinationTile1 = this.gameboard.getTileByCoordinates(this.moveToExecute[2], this.moveToExecute[1]);
        destinationTile1.selected=false;
        let destinationTile2;
        if (this.moveToExecute[3] != null){
            destinationTile2 = this.gameboard.getTileByCoordinates(this.moveToExecute[4], this.moveToExecute[3]);
            destinationTile2.selected=false;
        }

        if (moveReply == false){
            alert("Move Not Possible!");
            this.state="pick first tile human";
            return;
        }

        this.number_passes=0;
        let pieceToMove1=this.gameboard.getFirtsPieceFreeToMove(this.moveToExecute[0]);
        let originTile1 = this.gameboard.getTileHoldingPiece(pieceToMove1);
        this.gameboard.movePiece(pieceToMove1, this.moveToExecute[2], this.moveToExecute[1]);
        if (this.moveToExecute[3] == null)
            this.gameSequence.addGameMove(new MyGameMove(this.scene, this.moveToExecute[0], pieceToMove1, originTile1, destinationTile1, null, null, null, this.gameboard));
        else{
            let pieceToMove2 = this.gameboard.getFirtsPieceFreeToMove(this.moveToExecute[0]);
            let originTile2 = this.gameboard.getTileHoldingPiece(pieceToMove2);
            this.gameboard.movePiece(pieceToMove2, this.moveToExecute[4], this.moveToExecute[3]);
            this.gameSequence.addGameMove(new MyGameMove(this.scene, this.moveToExecute[0], pieceToMove1, originTile1, destinationTile1, pieceToMove2, originTile2, destinationTile2, this.gameboard));
        }

        this.currentPlayer = (this.currentPlayer % 2) + 1;
        this.moveToExecute=[];
        this.state = "animation";
    }

    undo(){
        this.gameboard = this.gameSequence.undoGameMove();
        this.currentPlayer = (this.currentPlayer % 2) + 1;
        if (this.number_passes>0)
            this.number_passes--;
        //activate animation
        this.state="animation";
    }

    movie(){
        //activate animation
        this.state="animation";
    }

    orchestrate(){
        switch(this.state){
            case "start":
                this.state="menu";
                this.menu();
                break;
            case "menu":
                this.scene.setPickEnabled(true);

                break;
            case "loading":
                this.scene.setPickEnabled(false);

                break;
            case "pick first tile human":
                this.scene.setPickEnabled(true);
                break;
            case "pick second tile human":
                this.scene.setPickEnabled(true);
                break;
            case "pick second tile human":
                this.scene.setPickEnabled(true);
                break;
            case "pick tiles pc":
                this.scene.setPickEnabled(false);
                //wait for eventListener to end work
                if (this.prolog.response != null){
                    this.moveToExecute = this.prolog.response;
                    this.prolog.response = null
                    this.state="render move";
                    sleep(2);
                    this.prolog.movePieceRequest(this.moveToExecute, this.gameboard.convertToPrologBoard());
                }
                break;
            case "render move":
                this.scene.setPickEnabled(false);
                //wait for response
                if (this.prolog.response != null){
                    this.renderMove();
                }
                break;
            case "animation":
                this.scene.setPickEnabled(false);
                
                //verificar se já atingiu stoping_time da animação
                this.state = "game end evaluation";
                if (this.number_passes<2)
                    this.prolog.gameOverRequest(this.gameboard.convertToPrologBoard());
                break;
            case "game end evaluation":
                this.scene.setPickEnabled(false);
                //wait for eventListener to end work
                if (this.number_passes>=2 || this.prolog.response != null){
                    let resp = this.prolog.response;
                    this.prolog.response = null
                    if (this.number_passes>=2 || resp){
                        this.state="calculate points 1";
                        this.prolog.calculatePointsRequest(this.gameboard.convertToPrologBoard(), 1);
                    }
                    else if (this.player[this.currentPlayer-1]){
                        this.state="pick tiles pc";
                        this.prolog.chooseMoveRequest(this.gameboard.convertToPrologBoard(), this.level, this.currentPlayer);
                    }
                    else
                        this.state="pick first tile human"; 
                }  
                break;
            case "calculate points 1":
                this.scene.setPickEnabled(false);
                //wait for eventListener to end work
                if (this.prolog.response != null){
                    this.points1 = this.prolog.response;
                    this.prolog.response=null;
                    this.state="calculate points 2";
                    this.prolog.calculatePointsRequest(this.gameboard.convertToPrologBoard(), 2);
                }
                break;
            case "calculate points 2":
                this.scene.setPickEnabled(false);
                //wait for eventListener to end work
                if (this.prolog.response != null){
                    this.points2 = this.prolog.response;
                    this.prolog.response=null;
                    this.prolog.calculateWinnerRequest(this.points1, this.points2);
                    this.state="calculate winner";
                }
                break;
            case "calculate winner":
                this.scene.setPickEnabled(false);
                //wait for eventListener to end work
                if (this.prolog.response != null){
                    let winner = this.prolog.response;
                    this.prolog.response=null;

                    let msg;
                    if (winner == 0)
                        msg="It's a Tie";
                    else
                        msg = "The winner is Player " + winner;
                    msg += "!\n" + "Group points by Player 1: " + this.points1 + "\nGroup points by Player 2: " + this.points2;
                    alert(msg);
                    this.state="menu";
                    this.menu()
                }
                break;
            case "undo":
                this.scene.setPickEnabled(false);
                break;
            case "movie":
                this.scene.setPickEnabled(false);
                break;
        }
    }

    display() {
        this.orchestrate();

        this.managePick();
        this.scene.clearPickRegistration();
        let numberPickedObjects=1;

        if (this.state == "pick first tile human" || this.state == "pick second tile human")
            numberPickedObjects = this.gameboard.display(true);
        else
            this.gameboard.display(false);

        //still need to work out id numbers and picking objects of the scene
        this.theme.render(numberPickedObjects);

        numberPickedObjects++;
        console.log(this.state);
        //buttons
        this.scene.pushMatrix();
        this.scene.translate(0, 5, 0);
        this.scene.registerForPick(numberPickedObjects++, this.undoButton);
        this.undoButton.display();
        this.scene.translate(0, 1, 0);
        this.scene.registerForPick(numberPickedObjects++, this.confirmButton);
        this.confirmButton.display();
        this.scene.translate(0, 1, 0);
        this.scene.registerForPick(numberPickedObjects++, this.removeButton);
        this.removeButton.display();
        this.scene.translate(0, 1, 0);
        this.scene.registerForPick(numberPickedObjects++, this.movieButton);
        this.movieButton.display();
        this.scene.translate(0, 1, 0);
        this.scene.registerForPick(numberPickedObjects++, this.exitButton);
        this.exitButton.display();
        this.scene.popMatrix();
        
        this.scene.clearPickRegistration();
        this.animator.display();
    }
     
    //add reaction to select buttons like undo (call function undo()), movie (call functionn movie()), exit, etc.
    onObjectSelected(obj, id) {
        if(obj instanceof MyTile){
            obj.selected=true;
            if (this.state == "pick first tile human"){
                this.moveToExecute = [this.currentPlayer, obj.y, obj.x];
                this.state = "pick second tile human";
            }
            else if (this.state == "pick second tile human"){
                this.moveToExecute.push(obj.y, obj.x);
                this.state="waiting confirm";
            }
        }
        else if (obj == this.confirmButton){
            if (this.state == "waiting confirm" || this.state == "pick first tile human" || this.state == "pick second tile human"){
                if (this.moveToExecute.length == 0){
                    this.gameSequence.addGameMove(new MyGameMove(this.scene, this.moveToExecute[0], null, null, null, null, null, null, this.gameboard));
                    this.number_passes++;
                    this.currentPlayer = (this.currentPlayer % 2) + 1;
                    this.state = "game end evaluation";
                    if (this.number_passes<2)
                        this.prolog.gameOverRequest(this.gameboard.convertToPrologBoard());
                }
                else{
                    this.prolog.movePieceRequest(this.moveToExecute, this.gameboard.convertToPrologBoard());
                    this.state="render move";
                }
            }
        }
        else if (obj == this.removeButton){
            if (this.state == "waiting confirm" || this.state == "pick second tile human"){
                let destinationTile1 = this.gameboard.getTileByCoordinates(this.moveToExecute[2], this.moveToExecute[1]);
                destinationTile1.selected=false;
                if (this.state == "waiting confirm"){
                    let destinationTile2 = this.gameboard.getTileByCoordinates(this.moveToExecute[4], this.moveToExecute[3]);
                    destinationTile2.selected=false;
                }
                this.moveToExecute = [];
                this.state = "pick first tile human";
            }
        }
        else if (obj == this.exitButton){
            this.gameSequence = new MyGameSequence(this.scene);
            this.animator = new MyAnimator(this.scene, this);
            this.gameboard = new MyGameboard(this.scene);

            this.state = "start";
            this.scene.setPickEnabled(false);
            this.currentPlayer=1;
            this.number_passes=0;
            this.moveToExecute = [];
        }
        else {
            console.log("Error: I can't happen!");
        }
    }

    managePick() {
        if (this.scene.pickMode == false /* && some other game conditions */){
            if (this.scene.pickResults != null && this.scene.pickResults.length > 0) { // any results?
                for (var i=0; i< this.scene.pickResults.length; i++) {
                    var obj = this.scene.pickResults[i][0]; // get object from result
                    if (obj) { // exists?
                        var uniqueId = this.scene.pickResults[i][1] // get id
                        this.onObjectSelected(obj, uniqueId);
                    }
                }
                // clear results
                this.scene.pickResults.splice(0, this.scene.pickResults.length);
            }
        }
    }
               
}

const sleep = (seconds) => {
    return new Promise(resolve => setTimeout(resolve, seconds*1000));
}