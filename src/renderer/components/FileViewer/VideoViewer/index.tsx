import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

import './index.css';

export type VideoViewerProps = {
  src: string;
};
const VideoViewer = (props: VideoViewerProps) => {
  const videoRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const { src } = props;

  useEffect(() => {
    const options = {
      autoplay: true,
      controls: true,
      preload: 'auto',
      sources: [
        {
          src: src,
          type: 'video/mp4',
        },
      ],
    };
    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [src, videoRef]);


  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return <div className="video-viewer" ref={videoRef} />;
};
export default VideoViewer;
