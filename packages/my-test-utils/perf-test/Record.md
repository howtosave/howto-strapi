# Performance Test Records

## Local Server with Mongo, 1 instances

| totalRequests | totalTime(s) | Requests per second | meanLatencyMs | maxLatencyMs |
|-|-|-|-|-|
| 10 | 1.32 | 8 | 25.3 | 68 |
| 100 | 10.72 | 9 | 38 | 47 |
| 1000 | 10.32 | 97 | 25.3 | 78 |

### v2.4.0 get (1 document)

```txt
Target URL:          get http://127.0.0.1:1337/nitroapi/noop/model
Max requests:        10000
Concurrency level:   100
Requests per second: 10

Completed requests:  10000
Total errors:        3000
Total time:          26.722645656 s
Requests per second: 374
Mean latency:        6505.7 ms
Max  latency:        15199 ms

Percentage of the requests served within a certain time
  50%      5844 ms
  90%      14764 ms
  95%      14936 ms
  99%      15073 ms
 100%      15199 ms (longest request)
```

