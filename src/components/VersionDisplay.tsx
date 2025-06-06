import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const VersionInfo = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #ccc;
  padding: 8px 12px;
  border-radius: 5px;
  z-index: 1000;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    color: white;
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