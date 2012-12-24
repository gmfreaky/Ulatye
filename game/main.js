var canvas;
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
var gl;

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var maindir = "game/";

var shaderProgram;

var resourceLoader;

function main()
{
    resourceLoader = new ResourceLoader();
    
    canvas = document.id("gamecanvas");
    alert("hi");
    initGL(canvas);
    
    initShaders();
    initBuffers();

    gl.clearColor(0,0,0,1);
    gl.enable(gl.DEPTH_TEST);

    drawScene();
}
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
    catch (e) {console.log("Error initaliasing WebGL, "+e);}
    if (!gl) {
        alert("Your browser doesn't support WebGL. Please download a browser that supports WebGL, e.g. Google Chrome or Firefox.");
    }
}

function initBuffers()
{
    // Create triangle buffer
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

    var tri_vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tri_vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    // Create square buffer
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);

    var sq_vertices = [
        1,  1, 0,
        -1, 1, 0,
        1, -1, 0,
        -1,-1, 0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sq_vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

function initShaders() {
    
    var fragmentShader = loadShader(gl, "test.frag", "fragment");
    var vertexShader = loadShader(gl, "test.vert", "vertex");
    
    alert("fragmentShader = "+fragmentShader);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);
    
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function loadShader(gl, name, type)
{
    console.log("Loading shader "+name);
    var loadRequest = new Request({
        method: 'GET',
        url: maindir+'shaders/'+name,
        onSuccess: function(content) {
            console.log("Succesfully loaded shader "+name);
            return initShader(gl, content, type);
        },
        onFailure: function(error) {
            console.log("Error loading shader "+name);
            return;
        }
    });
    loadRequest.send();
}

function initShader(gl, string, type) {
    console.log("Initaliazing shader, content =");
    console.log(string);
    var shader;
    
    if (type=="fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
        console.log("it's a frag shader.");
    }
    else if (type=="vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
        console.log("it's a vertex shader.");
    }
    else {
        return null;
    }

    gl.shaderSource(shader, string);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.viewportWidth/gl.viewportHeight, 0.1, 100, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
    mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemsize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}