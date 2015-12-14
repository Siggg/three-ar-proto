/*jslint browser:true */
/*global THREE, THREEx, alert, AR, POS, requestAnimationFrame*/

var videoWebcam, canvas, context, imageData, detector, posit;
var markers;
var rendererLeftDebug, rendererRightDebug, rendererLeftEye, rendererRightEye;
var sceneLeftDebug, sceneRightDebug, sceneLeftEyeWebcam, sceneLeftEyeProjection, sceneRightEyeWebcam, sceneRightEyeProjection;
var cameraLeftDebug, cameraRightDebug, cameraLeftEyeWebcam, cameraLeftEyeProjection, cameraRightEyeWebcam, cameraRightEyeProjection;
var planeLeftDebug, planeRightDebug, modelLeftEye, modelRightEye, textureLeftEye, textureRightEye;
var step = 0.0;
var updateFcts	= [];
var modelSize = 35.0; //millimeters

function createRenderers() {//on cr�e les diff�rents rendus selon les divs
    "use strict";
    

    rendererLeftEye = new THREE.WebGLRenderer({antialias: true});
    rendererLeftEye.setClearColor(0xffffff, 1);
    rendererLeftEye.setSize(canvas.width * 4/3, canvas.height);
    document.getElementById("containerLeftEye").appendChild(rendererLeftEye.domElement);
    // effect = new THREE.StereoEffect(rendererLeftEye);//ajout
    sceneLeftEyeWebcam = new THREE.Scene();
    cameraLeftEyeWebcam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    //cameraLeftEyeWebcam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    sceneLeftEyeWebcam.add(cameraLeftEyeWebcam);
    sceneLeftEyeProjection = new THREE.Scene();//canvas � doite en haut o� se projette la vid�o en ar
    //cameraLeftEyeProjection = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
	//cameraLeftEyeProjection = new THREE.PerspectiveCamera(52, canvas.width*4/5 / canvas.height*4/3.97, 1, 1000 );
	cameraLeftEyeProjection = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
    sceneLeftEyeProjection.add(cameraLeftEyeProjection);

    rendererRightEye = new THREE.WebGLRenderer({antialias: true});
    rendererRightEye.setClearColor(0xffffff, 1);
    rendererRightEye.setSize(canvas.width * 4/3, canvas.height);
    document.getElementById("containerRightEye").appendChild(rendererRightEye.domElement);
    sceneRightEyeWebcam = new THREE.Scene();
    cameraRightEyeWebcam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5 );
    //camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    sceneRightEyeWebcam.add(cameraRightEyeWebcam);
    sceneRightEyeProjection = new THREE.Scene();//canvas � doite en haut o� se projette la vid�o en ar
    //cameraRightEyeProjection = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
	//cameraRightEyeProjection = new THREE.PerspectiveCamera(52, canvas.width *4/5/ canvas.height*4/3.97, 1, 1000 );
	cameraRightEyeProjection = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
	
    sceneRightEyeProjection.add(cameraRightEyeProjection);0
}

function createPlane() {
    "use strict";
    var object = new THREE.Object3D(),
        geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0),
        material = new THREE.MeshNormalMaterial(),
        mesh = new THREE.Mesh(geometry, material);

    object.add(mesh);

    return object;
}

function createWebcamTexture() {
    "use strict";
    var texture,
        object,
        geometry,
        material,
        mesh;
    texture = new THREE.Texture(videoWebcam);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    object = new THREE.Object3D();
    geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0);
	//geometry = new THREE.BoxGeometry(1.0, 1.0, 0.0);
    material = new THREE.MeshBasicMaterial({map: texture,
        depthTest: false,
        depthWrite: false});
    mesh = new THREE.Mesh(geometry, material);
    object.position.z = -1;
    object.add(mesh);
    return object;
}

function createProjectionTexture() {
    "use strict";
    // scene = new THREE.Scene();
    var url,
	    canPlayMp4	= document.createElement('video').canPlayType('video/mp4') !== '' ? true : false,
	    canPlayOgg	= document.createElement('video').canPlayType('video/ogg') !== '' ? true : false,
        canPlayWmv = document.createElement('video').canPlayType('video/wmv') !== '' ? true : false,
         //Initialisation des vid�os � lancer sur la forme
        imageContext,
        videoTexture,
        texture,
        object,
        geometry,
        material,
        mesh;
    //projet�e
	if (canPlayWmv) {
		url = 'textures/mot_arabe.wmv';
	}else if	(canPlayMp4) {
        url	= 'textures/mot_arabe.mp4';
    }
	else if (canPlayOgg) {
        url	= 'textures/mot_arabe.ogg';
    } 
	
     else {
        alert('cant play mp4 or ogv'); //appel des vid�os selon le format support� par le navigateur
    }
    // create the videoTexture
    videoTexture = new THREEx.VideoTexture(url); //on cr�e une texture vid�o
    texture = videoTexture.texture;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    updateFcts.push(function (delta, now) {
        videoTexture.update(delta, now);
    });
    object = new THREE.Object3D();//on cr�e le plane
	//geometry = new THREE.PlaneGeometry(3, 3, 0.0); //
	geometry	= new THREE.BoxGeometry(2,3,0),
   
   material = new THREE.MeshBasicMaterial({ //On ajoute la vid�o texture � la forme cr��e
        map	: videoTexture.texture,
        transparent: false,
        opacity: 1
    });
    //transparent: true, opacity: 0.5 si on met �a, on rend la vid�o transparente mais pas l'objet lui m�me...
    mesh = new THREE.Mesh(geometry, material);
    object.add(mesh);
    return object;
	
	cameraRightEyeProjection.lookAt(videoTexture.position);
	camera.position.distanceTo( videoTexture.position );
	cameraLeftEyeProjection.lookAt(videoTexture.position);
	camera.position.distanceTo( videoTexture.position );
    //J'enl�ve et la rotation de l'objet et le on off pour la vid�o
    //updateFcts.push(function(delta, now){
    //	mesh.rotation.x += 1 * delta;
    //	mesh.rotation.y += 2 * delta;		
    //})
    //function onVideoPlayButtonClick(){
    //	video.play()
    //}
    //function onVideoPauseButtonClick(){
    //	video.pause()
    //}
	
	
}

function createScenes() { // on cr�e les sc�nes qui seront affich�es
    "use strict";
   

    textureLeftEye = createWebcamTexture();
    sceneLeftEyeWebcam.add(textureLeftEye);

    modelLeftEye = createProjectionTexture();
    sceneLeftEyeProjection.add(modelLeftEye);

    textureRightEye = createWebcamTexture();
    sceneRightEyeWebcam.add(textureRightEye);

    modelRightEye = createProjectionTexture();
    sceneRightEyeProjection.add(modelRightEye);

}

function snapshot() {
    "use strict";
    context.drawImage(videoWebcam, 0, 0, canvas.width, canvas.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);//Dessin de la vid�o d'enregistrement
	}

function drawCorners(markers) {//on dessine en temps r�el les coins du marqueur sur le marqueur fen�tre de gauche en haut 
    "use strict";
    var corners, corner, i, j;

    context.lineWidth = 3;

    for (i = 0; i < markers.length; ++i) {
        corners = markers[i].corners;
        context.strokeStyle = "red";
        context.beginPath();

        for (j = 0; j < corners.length; ++j) {
            corner = corners[j];
            context.moveTo(corner.x, corner.y);
            corner = corners[(j + 1) % corners.length];
            context.lineTo(corner.x, corner.y);
        }

        context.stroke();
        context.closePath();
        context.strokeStyle = "green";
        context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
    }
}

function updateObject(object, rotation, translation) {//Mise � jour de l'objet projet� en temps r�el
    "use strict";
    object.scale.x = modelSize ;
    object.scale.y = modelSize;
    object.scale.z = modelSize;

    object.rotation.x = -Math.asin(-rotation[1][2]) ;
    object.rotation.y = -Math.atan2(rotation[0][2] -0.388, rotation[2][2]);
    object.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);

	object.position.x = translation[0] +100;
    object.position.y = translation[1]-30;
    object.position.z = -translation[2]-1.4;
	
  
}

function updatePose(id, error, rotation, translation) { // les retours si arr�t de reconnaissance du marqueur, je crois
    "use strict";
    var yaw = -Math.atan2(rotation[0][2], rotation[2][2]),
        pitch = -Math.asin(-rotation[1][2]),
        roll = Math.atan2(rotation[1][0], rotation[1][1]),
        d = document.getElementById(id);
    d.innerHTML = " error: "
        + error
        + "<br/>"
        + " x: " + (translation[0] | 0)
        + " y: " + (translation[1] | 0)
        + " z: " + (translation[2] | 0)
        + "<br/>"
        + " yaw: " + Math.round(-yaw * 180.0 / Math.PI)
        + " pitch: " + Math.round(-pitch * 180.0 / Math.PI)
        + " roll: " + Math.round(roll * 180.0 / Math.PI);
}

function updateScenes(markers) { //mise � jour de la sc�ne
    "use strict";
    var corners, corner, pose, i;
    if (markers.length > 0) {
        corners = markers[0].corners;

        for (i = 0; i < corners.length; ++i) {
            corner = corners[i];
            corner.x = corner.x - (canvas.width/ 2 );
            corner.y = (canvas.height/ 2) - corner.y;
        }

        pose = posit.pose(corners);
        //updateObject(planeLeftDebug, pose.bestRotation, pose.bestTranslation);
       // updateObject(planeRightDebug, pose.alternativeRotation, pose.alternativeTranslation);
        updateObject(modelLeftEye, pose.bestRotation, pose.bestTranslation) ;
        updateObject(modelRightEye, pose.bestRotation, pose.bestTranslation) ;
        //updatePose("pose1", pose.bestError, pose.bestRotation, pose.bestTranslation);
        //updatePose("pose2", pose.alternativeError, pose.alternativeRotation, pose.alternativeTranslation);
        step += 0.025;
        // model.rotation.z -= step;
    }

    textureLeftEye.children[0].material.map.needsUpdate = true;//Permet de lancer la vid�o d'enregistrement en fen�tre de droite en haut et de l'actualiser
    textureRightEye.children[0].material.map.needsUpdate = true;//Permet de lancer la vid�o d'enregistrement en fen�tre de droite en haut et de l'actualiser

}

function render() {//on cr�e les diff�rents rendus selon les div
    "use strict";
    

    rendererLeftEye.autoClear = false;
    rendererLeftEye.clear();
    rendererLeftEye.render(sceneLeftEyeWebcam, cameraLeftEyeWebcam);
    rendererLeftEye.render(sceneLeftEyeProjection, cameraLeftEyeProjection);//Projection du mod�le

    rendererRightEye.autoClear = false;
    rendererRightEye.clear();
    rendererRightEye.render(sceneRightEyeWebcam, cameraRightEyeWebcam);
    rendererRightEye.render(sceneRightEyeProjection, cameraRightEyeProjection);
}

function tick() {
    "use strict";
    requestAnimationFrame(tick);

    if (videoWebcam.readyState === videoWebcam.HAVE_ENOUGH_DATA) {
        snapshot(); //on lance la vid�o et on la projette dans le canvas

        var markers = detector.detect(imageData);
        drawCorners(markers); //on dessine en temps r�el les coins du marqueur
        updateScenes(markers); //on met � jour la d�tection des marqueurs sans cesse

        render(); //appel de la fonction "rendre"
    }
}

function init() {
    "use strict";
    navigator.getUserMedia({video: true}, // on peut utiliser la vid�o
        function (stream) {
            if (window.webkitURL) {
                videoWebcam.src = window.webkitURL.createObjectURL(stream);
            } else if (videoWebcam.mozSrcObject !== undefined) {
                videoWebcam.mozSrcObject = stream;
            } else {
                videoWebcam.src = stream;//selon les navigateurs on cr�e une url pour lancer l'enregistrement
            }
        },
        function (error) {
        }
        );

    detector = new AR.Detector();//on appelle la d�tection
	//detector.id = 0;//ajout pour le marqueur
    posit = new POS.Posit(modelSize, window.innerWidth/2);//on appelle la mise � jour de la d�tection et je CHANGE EN WINDOW LE CANVAS
//et je le divise par 2
    createRenderers();//fonction qui cr�e le rendu
    createScenes();//celle qui cr�e la sc�ne

    requestAnimationFrame(tick);//celle qui actualise la sc�ne et donc ici t�lescopage car il faut actualiser aussi la vid�o projet�e
    //le nouveau canvas �tant cr�� je peux lancer l'animation et l'actualisation de la vid�o sur le plane

    var lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec	= lastTimeMsec || nowMsec - 1000 / 60;//Je diminue la valeur � 100 pour am�liorer 
		//la stabilit� de le projection
        var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec	= nowMsec;
         //call each update function
        updateFcts.forEach(function (updateFn) {
            updateFn(deltaMsec / 1000, nowMsec / 1000);//Je mets 100 au lieu de mille pour am�liorer la 
			//stabilit� de la projection.
        });
    });
//La m�thode window.requestAnimationFrame() notifie le navigateur que vous souhaitez executer une animation et demande que celui-ci execute une 
//fonction sp�cifique de mise � jour de l'animation, avant le prochain repaint du navigateur. Cette m�thode prend comme argument un callback qui sera
// appel� avant le repaint du navigateur.
}

function onLoad() {
    "use strict";
    videoWebcam = document.getElementById("video");
    canvas = document.getElementById("baseCanvas");
    context = canvas.getContext("2d");
   canvas.width = window.innerWidth /2 ;//au lieu de window.innerWidth /2
     canvas.height = window.innerHeight;//initialisation du canvas
	
     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (navigator.getUserMedia) {
        init();
    } //v�rification de la possiblit� d'utiliser la vid�o dans le navigateur
}

window.onload = onLoad; //on lance window.onload