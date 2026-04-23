import { useEffect, useRef, useCallback } from 'react';
import WebRTCService from '../services/webrtc';

export function useWebRTC({ onSignal, onStream, onError }) {
  const serviceRef = useRef(null);

  useEffect(() => {
    serviceRef.current = new WebRTCService();
    serviceRef.current.onSignal = onSignal;
    serviceRef.current.onStream = onStream;
    serviceRef.current.onError = onError;
    return () => {
      serviceRef.current?.destroy();
    };
  }, [onSignal, onStream, onError]);

  const initLocalStream = useCallback(async () => {
    return serviceRef.current?.initLocalStream();
  }, []);

  const createPeer = useCallback((isInitiator, stream) => {
    return serviceRef.current?.createPeer(isInitiator, stream);
  }, []);

  const signal = useCallback((data) => {
    serviceRef.current?.signal(data);
  }, []);

  const toggleAudio = useCallback((enabled) => {
    serviceRef.current?.toggleAudio(enabled);
  }, []);

  const toggleVideo = useCallback((enabled) => {
    serviceRef.current?.toggleVideo(enabled);
  }, []);

  const destroy = useCallback(() => {
    serviceRef.current?.destroy();
  }, []);

  return {
    service: serviceRef.current,
    initLocalStream,
    createPeer,
    signal,
    toggleAudio,
    toggleVideo,
    destroy,
  };
}

export default useWebRTC;