import { usePlayer } from "../../contexts/PlayerContext";
import styles from "./styles.module.scss";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { convertToDurationToTimeString } from "../../utils/convertDurationToTimeString";

export function Player() {

  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress,setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    toggleLoop,
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    isShuffling,
    toggleShuffle,
    clearPlayerState
  } = usePlayer();

  useEffect (() => {
    if(!audioRef.current){
      return;
    }
    if(isPlaying){
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener(){
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate',event =>{
      setProgress(Math.floor(audioRef.current.currentTime)); 
    });
  }

  function handleSeek(amount:number){
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded(){
    if(hasNext){
      playNext();
    }else{
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong> Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ""}>
        <div className={styles.progress}>
        <span>{convertToDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {/* <div className={styles.emptySlider} /> */}
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: "#84d361" }}
                railStyle={{ background: "#9f75ff" }}
                handleStyle={{ borderColor: "#84d361", borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertToDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && <audio 
        src={episode.url} 
        ref={audioRef} 
        autoPlay
        loop={isLooping}
        onEnded={handleEpisodeEnded}
        onPlay={() => setPlayingState(true)}
        onPause={() => setPlayingState(false)}
        onLoadedMetadata={setupProgressListener}
        ></audio>}

        <div className={styles.buttons}>
          <button type="button" disabled={!episode || episodeList.length === 1}
          onClick={toggleShuffle}
          className={isLooping ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button type="button" disabled={!episode || !hasPrevious} onClick={playPrevious}>
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="Tocar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
            )}
          </button>
          <button type="button" disabled={!episode  || !hasNext} onClick={playNext}>
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          <button type="button" disabled={!episode}
          className={isLooping ? styles.isActive : ''}
          onClick={toggleLoop}>
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
