import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const VersionInfo = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #ccc;
  padding: 6px 10px;
  border-radius: 6px;
  z-index: 1000;
  font-size: 10px;
  font-family: 'Courier New', monospace;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    color: white;
  }
  
  @media (max-width: 768px) {
    bottom: 5px;
    right: 5px;
    padding: 4px 8px;
    font-size: 9px;
  }
`;

interface VersionData {
  shortHash: string;
  branch?: string;
  buildTime?: string;
}

export const VersionDisplay: React.FC = () => {
  const [version, setVersion] = useState<VersionData>({ shortHash: 'dev' });

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const versionModule = await import('../version');
        setVersion(versionModule.version);
      } catch (e) {
        console.warn('Version file not found, using dev fallback');
        // Keep the default 'dev' version
      }
    };

    loadVersion();
  }, []);

  return (
    <VersionInfo title={`Branch: ${version.branch || 'unknown'}\nBuild: ${version.buildTime || 'unknown'}`}>
      commit: {version.shortHash}
    </VersionInfo>
  );
}; 