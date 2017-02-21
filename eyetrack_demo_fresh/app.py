#!/usr/bin/env python
from flask import Flask, render_template, session, request, jsonify
from flask_socketio import SocketIO, emit, disconnect
import socket
from threading import Thread
import json
import re

# for socketio
import eventlet
eventlet.monkey_patch()

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = 'eventlet'
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)

# Socket connection info for Eyetribe
TCP_IP = '127.0.0.1'
TCP_PORT = 6555 #EyeTribe port
BUFFER_SIZE = 1024
MESSAGE = "Hello, World!"

# Globals
thread = None


def connectEyetribe():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((TCP_IP, TCP_PORT))
    s.send(MESSAGE)
    while True:
        try:
            data = s.recv(BUFFER_SIZE)
            if ('\n' in data):
                gaze_objs = data.split('\n')
                socketio.emit('send_gaze_data', {'data': gaze_objs[0]})
            else:
                socketio.emit('send_gaze_data', {'data': data})            
        except socket.error as e:
            s.close()
            print "Error", e
            raise e


@app.route('/')
def index():
    global thread
    if thread is None:
        thread = Thread(target=connectEyetribe)
        thread.start()
    return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('first_connection')
def test_message(message):
    # session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data']})


@socketio.on('click_test_front')
def test_message(message):
    # session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data']})

@socketio.on('click_test_back')
def test_message(message):
    # session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'send data from backend'})



if __name__ == '__main__':
    socketio.run(app, debug=True)
   

