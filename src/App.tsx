import React from 'react';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

function App() {
  const logs = [{ title: 'test1 init', result: '...' }, { title: 'test2 init', result: '...'}]
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

const LogContainer: React.FC<{ logs: { title: string; result: string; }[]}> = ({ logs }) => {
  return (
    <>
      {
        logs.map((log ,index) => {
          return (
            <Box mb={2} key={index.toString()}>
              <Typography variant="h6">{log.title}</Typography>
              <Typography variant="body1">{log.result}</Typography>
            </Box>
          );
        })
      }
    </>
  )
}

export default App;
