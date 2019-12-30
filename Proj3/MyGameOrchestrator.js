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
        this.prolog.sendPrologRequest(['quit'], this.prolog.handleReply);
        
        this.state = "menu";
    }

    update(time) {
        this.animator.update(time);
    }

    orchestrate(){
        switch(this.state){
            case "menu":

                break;
            case "loading":

                break;
            case "next turn human":

                break;
            case "next turn pc":

                break;
            case "render move human":

                break;
            case "render move pc":

                break;
            case "piece selection human":

                break;
            case "piece selection pc":

                break;
            case "animation":

                break;
            case "game end evaluation":

                break;
            case "end game":

                break;
            case "undo":

                break;
            case "movie":

                break;
            case "undo":

                break;
        }
    }

    display() {
    //...
    this.theme.display();
    this.gameboard.display();
    this.animator.display();
    //...
    }

    managePick(mode, results) {
        if (mode == false /* && some other game conditions */){
            if (results != null && results.length > 0) { // any results?
                for (var i=0; i< results.length; i++) {
                    var obj = pickResults[i][0]; // get object from result
                    if (obj) { // exists?
                        var uniqueId = pickResults[i][1] // get id
                        this.OnObjectSelected(obj, uniqueId);
                    }
                }
                // clear results
                pickResults.splice(0, pickResults.length);
            }
        }
    }
     
    onObjectSelected(obj, id) {
        if(obj instanceof MyPiece){
            // do something with id knowing it is a piece
        }
        else if(obj instanceof MyTile){
            // do something with id knowing it is a tile
        }
        else {
            // error ?
        }
    }
        
        
}