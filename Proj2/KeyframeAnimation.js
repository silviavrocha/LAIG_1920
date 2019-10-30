/**
 * Animation
 */
class KeyframeAnimation extends CGFobject {
	constructor(scene, id, keyframes){
        super(scene);
        this.id=id;
        this.keyframes=keyframes;
        this.keyframes.sort((a, b) => (a.instant > b.instant) ? 1 : -1);
        this.initial_time=0;
        this.matrix=mat4.create();
    }
    
    update(t){
        if (this.initial_time==0){
            this.initial_time=t;
        }
        var delta=t-this.initial_time;
        var f=-1;
        for (var i=0; i<this.keyframes.length; i++){
            if (this.keyframes[i].instant > delta){
                f=i;
                break;
            }
        }
        console.log("delta: " + delta);
        console.log("f: " + f);
        if (f==-1)
            return;
        var keyframe1 = this.keyframes[f-1];
        var keyframe2 = this.keyframes[f];

        var n=(keyframe2.instant-keyframe1.instant)/(delta-keyframe1.instant);

        var rx=keyframe1.rx + (keyframe2.rx - keyframe1.rx)*(delta-2*keyframe1.instant)/(keyframe2.instant-2*keyframe1.instant);
        var ry=keyframe1.ry + (keyframe2.ry - keyframe1.ry)*(delta-2*keyframe1.instant)/(keyframe2.instant-2*keyframe1.instant);
        var rz=keyframe1.rz + (keyframe2.rz - keyframe1.rz)*(delta-2*keyframe1.instant)/(keyframe2.instant-2*keyframe1.instant);
        var tx=keyframe1.tx + (keyframe2.tx - keyframe1.tx)*(delta-2*keyframe1.instant)/(keyframe2.instant-2*keyframe1.instant);
        var ty=keyframe1.ty + (keyframe2.ty - keyframe1.ty)*(delta-2*keyframe1.instant)/(keyframe2.instant-2*keyframe1.instant);
        var tz=keyframe1.tz + (keyframe2.tz - keyframe1.tz)*(delta-2*keyframe1.instant)/(keyframe2.instant-2*keyframe1.instant);
        var sx=Math.pow(keyframe2.sx/keyframe1.sx, 1/n);
        var sy=Math.pow(keyframe2.sy/keyframe1.sy, 1/n);
        var sz=Math.pow(keyframe2.sz/keyframe1.sz, 1/n);

        this.matrix=mat4.create();
        mat4.translate(this.matrix, this.matrix, [tx, ty, tz]);
        mat4.scale(this.matrix, this.matrix, [sx, sy, sz]);   
        mat4.rotateX( this.matrix, this.matrix, rx);
        mat4.rotateY( this.matrix, this.matrix, rx);
        mat4.rotateZ( this.matrix, this.matrix, rx);
    };

    apply(mult){
        mat4.multiply(mult, mult, this.matrix);
    };
}