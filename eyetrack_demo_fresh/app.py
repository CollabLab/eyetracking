#!/usr/bin/env python
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, disconnect

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)


@app.route('/')
def index():
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
    global obj1
    # session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': "data from backend"})



if __name__ == '__main__':
    socketio.run(app, debug=True)

