import authService from "../api-authorization/AuthorizeService";


export async function OnVideoPause(hubConnection, instanceName) {
    if (hubConnection && instanceName) {
        hubConnection.invoke("StateChange", instanceName, await authService.getAccessToken(), "Paused").catch(function (err) {
            return console.error(err.toString());
        });
    }
}

export async function OnVideoPlay(hubConnection, instanceName) {
    if (hubConnection && instanceName) {
        hubConnection.invoke("StateChange", instanceName, await authService.getAccessToken(), "Playing").catch(function (err) {
            return console.error(err.toString());
        });
    }
}

export async function OnVideoFinished(videoList, setVideoList) {
    if (videoList != null) {
        const index = videoList[0];
        let videoListCopy = [...videoList];
        videoListCopy.splice(index, 1);
        setVideoList(videoListCopy);
    }
}

export async function OnProgressChange(playerRef, time) {
    if (playerRef != null) {
        var difference = playerRef?.current?.internalPlayer.getCurrentTime() - time;
        if (difference < -2 || difference > 2) {
            playerRef?.current?.internalPlayer.seekTo(time);
        }
    } else {
        
    }
}