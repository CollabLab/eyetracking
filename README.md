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
