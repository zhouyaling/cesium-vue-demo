#ifdef GL_ES 
precision mediump float;
#endif 
varying vec2 v_st;    
                        varying float v_width;    
                        varying float v_polylineAngle;
                        varying vec4 v_positionEC;
                        varying vec3 v_normalEC;
void main(){

    float r = 212.0;
    float g = 212.0;
    float b = 20.0;
    float a = 1.0;

     gl_FragColor = vec4(r,g,b,a);
    }