import React, { useCallback, useState, useMemo } from 'react';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Device from './utils/device';

function App() {
  const [logs, setLogs] = useState<{ title: string; result: string[]; }[]>([]);
  const handleAddLog = useCallback((title: string, value: string) => {
    const theLogIndex = logs.findIndex((item) => item.title === title);
    if (typeof theLogIndex !== 'number') return;
    const update = [...logs];
    update[theLogIndex].result.push(value);
    setLogs(update);
  }, [logs]);

  const aliceDevice = useMemo(() => new Device({ identity: 'alice', log: handleAddLog }), [handleAddLog]);
  const bobDevice = useMemo(() => new Device({ identity: 'bob', log: handleAddLog }), [handleAddLog]);
  aliceDevice.initialize();

  return (
    <Container>
      <Box py={2}>
        <Box display="flex" mb={3}>
          <Box mr={2}>
            <Button variant="contained" color="primary">START</Button>
          </Box>
          <Button variant="contained">RESET</Button>
        </Box>
        <Box>
          <Typography variant="h4">Test E3Kit Methods</Typography>
          <Box mt={2}>
            <LogContainer logs={logs} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

const LogContainer: React.FC<{ logs: { title: string; result: string[]; }[]}> = ({ logs }) => {
  return (
    <>
      {
        logs.map((log ,index) => {
          return (
            <Box mb={2} key={index.toString()}>
              <Typography variant="h6">{log.title}</Typography>
              {log.result.map((item) => {
                return (
                  <Typography variant="body1" key={item}>{item}</Typography>
                );
              })}
            </Box>
          );
        })
      }
    </>
  )
}

export default App;
