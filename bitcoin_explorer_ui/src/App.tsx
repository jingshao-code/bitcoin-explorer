// import React, { useEffect, useState } from 'react';

// interface BlockData {
//   height: number;
//   tx_count: number;
//   price?: number;
//   timestamp?: string; // 添加 timestamp 字段
// }

// const App: React.FC = () => {
//   const [blockData, setBlockData] = useState<BlockData | null>(null);

//   useEffect(() => {
//     // 使用 SSE (Server-Sent Events) 来监听区块高度、交易数量和市场价格的更新
//     const eventSource = new EventSource('http://localhost:3001/block-height-stream');

//     eventSource.onmessage = (event) => {
//       try {
//         const data: BlockData = JSON.parse(event.data);
//         setBlockData(data);
//       } catch (error) {
//         console.error("Error parsing SSE data: ", error);
//       }
//     };

//     eventSource.onerror = (error) => {
//       console.error("Error with SSE connection: ", error);
//       eventSource.close();
//     };

//     // 在组件卸载时关闭 SSE 连接
//     return () => {
//       eventSource.close();
//     };
//   }, []);

//   return (
//     <div style={{ textAlign: 'center', marginTop: '20%' }}>
//       <h1>Bitcoin Explorer</h1>
//       <h2>Current Block Height: {blockData ? blockData.height : 'Loading...'}</h2>
//       <h2>Transaction Count: {blockData ? blockData.tx_count : 'Loading...'}</h2>
//       <h2>
//         Bitcoin Price: $
//         {blockData && blockData.price !== undefined
//           ? blockData.price.toFixed(2)
//           : 'Loading...'}
//       </h2>
//       <h2>
//         Last Updated: {blockData ? blockData.timestamp : 'Loading...'}
//       </h2>
//     </div>
//   );
// };

// export default App;




import React, { useEffect, useState } from 'react';

interface BlockData {
  height: number;
  tx_count: number;
  price?: number;
  timestamp?: string; // 添加 timestamp 字段
}

const App: React.FC = () => {
  const [blockData, setBlockData] = useState<BlockData | null>(null);

  useEffect(() => {
    // 使用 SSE (Server-Sent Events) 来监听区块高度、交易数量和市场价格的更新
    const eventSource = new EventSource('http://localhost:3001/block-height-stream');

    eventSource.onmessage = (event) => {
      try {
        const data: BlockData = JSON.parse(event.data);
        setBlockData(data);
      } catch (error) {
        console.error("Error parsing SSE data: ", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Error with SSE connection: ", error);
      eventSource.close();
    };

    // 在组件卸载时关闭 SSE 连接
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>Bitcoin Explorer</h1>
      <h2>Current Block Height: {blockData ? blockData.height : 'Loading...'}</h2>
      <h2>Transaction Count: {blockData ? blockData.tx_count : 'Loading...'}</h2>
      <h2>
        Bitcoin Price: $
        {blockData && blockData.price !== undefined
          ? blockData.price.toFixed(2)
          : 'Loading...'}
      </h2>
      <h2>
        Last Updated: {blockData ? blockData.timestamp : 'Loading...'}
      </h2>
    </div>
  );
};

export default App;
