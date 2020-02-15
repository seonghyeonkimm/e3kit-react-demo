import React, { useCallback, useState, useMemo, useEffect } from 'react';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Device from './utils/device';

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [current, setNext] = useState<number>(0);
  const [logs, setLogs] = useState<{ title: string; result: string[]; }[]>([]);
  const handleAddLog = (title: string, value: string) => {
    setLogs(prev => {
      const theLogIndex = prev.findIndex((item) => item.title === title);
      if (typeof theLogIndex !== 'number') return prev;

      const update = [...prev];
      if (theLogIndex > -1) {
        update[theLogIndex].result.push(value);
      } else {
        update.push({ title, result: [value] });
      }

      return update;
    });
  };

  const firstAdminDevice = useMemo(() => new Device({ email: 'admin@gmail.com', password: 'password', log: handleAddLog }), []);
  const secondAdminDevice = useMemo(() => new Device({ email: 'admin1@gmail.com', password: 'password', log: handleAddLog }), []);
  const handleNextClick = () => setNext(prev => prev + 1);
  const handleResetClick = () => window.location.reload();
  const handleFirstProcess = useCallback(async () => {
    setLoading(true);
    await firstAdminDevice.initialize();
    await secondAdminDevice.initialize();
    setLoading(false);
  }, [firstAdminDevice, secondAdminDevice])
  const handleSecondProcess = useCallback(async () => {
    setLoading(true);
    await firstAdminDevice.register();
    await secondAdminDevice.register();
    setLoading(false);
  }, [firstAdminDevice, secondAdminDevice])
  const handleThirdProcess = useCallback(async () => {
    setLoading(true);
    // for firstAdmin
    const secondAdminLookup = await firstAdminDevice.findUsers([secondAdminDevice.identity as string]);
    // for secondAdmin
    const firstAdminLookup = await secondAdminDevice.findUsers([firstAdminDevice.identity as string]);

    // firstAdmin send messages to secondAdmin and secondAdmin read it
    const firstAdminEncryptedText = await firstAdminDevice.encrypt(`Hello. I am ${firstAdminDevice.email}`, secondAdminLookup);
    await secondAdminDevice.decrypt(firstAdminEncryptedText, firstAdminLookup[firstAdminDevice.identity as string]);

    // secondAdmin send messages to firstAdmin and firstAdmin read it
    const secondAdminEncryptedText = await secondAdminDevice.encrypt(`Hello. I am ${secondAdminDevice.email}`, firstAdminLookup);
    await firstAdminDevice.decrypt(secondAdminEncryptedText, secondAdminLookup[secondAdminDevice.identity as string]);
    setLoading(false);
  }, [firstAdminDevice, secondAdminDevice]);
  const handleLastProcess = useCallback(async () => {
    setLoading(true);
    await firstAdminDevice.cleanup()
    await secondAdminDevice.cleanup()

    await firstAdminDevice.unregister()
    await secondAdminDevice.unregister()
    setLoading(false);
  }, [firstAdminDevice, secondAdminDevice])

  useEffect(() => {
    if (loading) return;

    if (current === 0) {
      handleFirstProcess();
      return;
    }

    if (current === 1) {
      handleSecondProcess();
      return;
    }

    if (current === 2) {
      handleThirdProcess();
      return;
    }

    if (current === 3) {
      handleLastProcess();
      return;
    }
    // eslint-disable-next-line
  }, [current])

  return (
    <Container>
      <Box py={2}>
        <Box display="flex" mb={3}>
          <Box mr={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextClick}
              disabled={loading || current === 4}>
                NEXT
              </Button>
          </Box>
          <Button variant="contained" onClick={handleResetClick}>RESET</Button>
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
