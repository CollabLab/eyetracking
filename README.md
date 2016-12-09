# Oliver Goodman's Eye Tracking Algorithm Debug Platform

## QuickStart (Assuming the EyeTribe SDK and PostGres are installed locally on your machine)
1. Clone the repository to your computer
2. Run the EyeTribe server script from your applications folder, should be something like ```/Applications/EyeTribe/EyeTribe```
3. Go into ```setup_db.py``` and replace ```user``` with your Postgres username. Then run ```Python setup_db``` to setup your local Postgres database. 
4. To make sure you have the correct requirements, run ```pip install -r requirements.txt```
5. Then, within the ```./eyetrack_demo``` folder, run the ```app.py``` file with python -> ```python app.py```
6. The application will run on localhost:5000. The animation controls handle the movement of the object to be tracked. 
    To record an eyetrack session, begin the animation by pressing "Play" and the object will start moving. Then, toggle on the "Record" button to begin tracking gaze coordinates, and toggle off to end the session. 
    You can playback your session with the "Playback Last Session" button. 
    To view a live stream of gaze coordinates onscreen, press the "Track" button and the cursor icon will update its position based on the coordinates the Eyetribe is reading. 



### Known bugs:
- Currently, the "Track" behavior (live display of the gaze coordinates) will interfere with any following behaviors. This means that if you "Track", and then try to immediately "Record" or "Playback", there might be some conflicts (the socket connection will break with the Flask server). While testing the functionality of the different features, I have just been been restarting the server and refreshing the application in the browser. I believe this is being caused by all the activity in ```background_thread()``` in ```app.py``` since currently the playback and tracking features are happening under the same thread.
- The movement of the object needs to be adjusted to fit on any sized monitor (right now it just follows a specific path). 
