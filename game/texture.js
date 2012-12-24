var Texture = new Class({
    initalize: function(url) {
        texture = gl.createTexture();
        image = new Image();
        image.onload = function() {
            handleLoadedTexture(gl, image, texture);
        }
    }
});

function handleLoadedTexture(gl, image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.BILINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.BILINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    resourceLoader.onLoadTexture(texture);
}