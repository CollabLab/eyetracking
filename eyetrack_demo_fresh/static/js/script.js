$(document).ready(function() {

    // // circular motion with just jquery
    // var element = document.getElementById('ball');
    // var angle = 0;
    // var x = 0;
    // var y = 0;
    // var w = (window.innerWidth - 50) / 2;
    // var h = (window.innerHeight - 50) / 2;

    // function ballCircle() {
    //     x = w + w * Math.cos(angle * Math.PI / 180);
    //     y = h + h * Math.sin(angle * Math.PI / 180);
        
    //     ball.style.left = x + 'px';
    //     ball.style.top = y + 'px';

    //     angle++;
    //     if (angle > 360) {
    //         angle = 0;
    //     }
    //     setTimeout(ballCircle,20);
    // }
    // ballCircle();

    $('#btn-start').click(function() {
        console.log('started!')
        circularMotion1();
    })
});

