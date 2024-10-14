use serde_json::Value;
use reqwest::blocking::{Client, ClientBuilder};
use serde_json::json;
use rusqlite::{params, Connection};
use chrono::Local;
use std::{error::Error, thread, time::Duration};

fn main() -> Result<(), Box<dyn Error>> {
    let db_path = "/usr/src/app/Documents/blockchain_data.db";

    // 打印数据库路径，确保路径正确
    println!("Trying to open database at path: {}", db_path);

    // 创建 HTTP 客户端，设置超时时间
    let client = ClientBuilder::new()
        .timeout(Duration::from_secs(10)) 
        .build()?;

    loop {
        // 尝试打开数据库连接，并打印调试信息
        match Connection::open(&db_path) {
            Ok(conn) => {
                println!("Successfully opened database.");
                
                // 创建表（如果不存在）
                conn.execute(
                    "CREATE TABLE IF NOT EXISTS block_data (
                        id INTEGER PRIMARY KEY,
                        height INTEGER NOT NULL,
                        tx_count INTEGER NOT NULL,
                        price REAL NOT NULL,
                        timestamp TEXT NOT NULL
                    )",
                    [],
                )?;

                // 获取区块高度和交易数量
                let (block_height, tx_count) = match get_block_height_and_tx_count(&client) {
                    Ok(result) => result,
                    Err(e) => {
                        eprintln!("Failed to get block height and transaction count: {}", e);
                        thread::sleep(Duration::from_secs(5)); // 等待 5 秒后重试
                        continue; 
                    }
                };

                // 获取比特币价格
                let bitcoin_price = match get_bitcoin_price(&client) {
                    Ok(price) => price,
                    Err(e) => {
                        eprintln!("Failed to get Bitcoin price: {}", e);
                        thread::sleep(Duration::from_secs(5)); // 等待 5 秒后重试
                        continue; 
                    }
                };

                // 获取当前时间戳
                let current_timestamp = Local::now().naive_local().format("%Y-%m-%d %H:%M:%S").to_string();

                // 生成要发送和存储的数据
                let block_data = json!({
                    "height": block_height,
                    "tx_count": tx_count,
                    "price": bitcoin_price,
                    "timestamp": current_timestamp,
                });

                // 将数据发送到 Node.js 服务器
                if let Err(e) = client.post("http://localhost:3001/update-block-data")
                    .json(&block_data)
                    .send()
                {
                    eprintln!("Failed to send data to Node.js server: {}", e);
                } else {
                    println!("Successfully sent data to Node.js server");
                }

                // 将数据存入数据库
                if let Err(e) = conn.execute(
                    "REPLACE INTO block_data (id, height, tx_count, price, timestamp) VALUES (1, ?1, ?2, ?3, ?4)",
                    params![block_height, tx_count, bitcoin_price, current_timestamp],
                ) {
                    eprintln!("Failed to insert data into database: {}", e);
                } else {
                    println!(
                        "Inserted data - Block height: {}, Transaction count: {}, Bitcoin price: ${}, Timestamp: {}",
                        block_height, tx_count, bitcoin_price, current_timestamp
                    );
                }
            }
            Err(e) => {
                println!("Failed to open database: {}", e);
                thread::sleep(Duration::from_secs(5)); // 等待 5 秒后重试
                continue;
            }
        }

        // 每秒更新一次数据
        thread::sleep(Duration::from_secs(1));
    }
}

// 获取区块高度和交易数量
fn get_block_height_and_tx_count(client: &Client) -> Result<(i64, i64), Box<dyn Error>> {
    let response = client.get("https://blockchain.info/q/getblockcount").send()?;
    let block_height: i64 = response.text()?.parse()?;

    let block_hash_response = client
        .get(&format!("https://blockchain.info/block-height/{}?format=json", block_height))
        .send()?;
    let block_hash_json: Value = block_hash_response.json()?;

    let tx_count = block_hash_json["blocks"][0]["n_tx"].as_i64().unwrap_or(0);

    Ok((block_height, tx_count))
}

// 获取比特币价格
fn get_bitcoin_price(client: &Client) -> Result<f64, Box<dyn Error>> {
    let response = client
        .get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
        .send()?;
    let json: Value = response.json()?;

    let price = json["bitcoin"]["usd"].as_f64().unwrap_or(0.0);
    Ok(price)
}
