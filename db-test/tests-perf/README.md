# DB Performance Test

Database 별 성능 측정을 위한 Test app.

## Test1: Read data from One Table

한 개의 테이블만 쿼리해서 처리되는 api 성능을 측정한다.

- 테스트 ID: READ1
- 관련 API: `GET /posts/:post/post-replies/:id`
- 관련 Table: post_replies

## Test2: Read data from Two Tables

2 개의 테이블을 참조 쿼리해서 처리되는 api 성능을 측정한다.

- 테스트 ID: READ2
- 관련 API: `GET /posts/:id?populate[0]=author`
- 관련 Table: up_users, posts

## Test3: Insert data to One Table

한 개의 테이블에만 데이터를 입력해서 처리되는 api 성능을 측정한다.

- 테스트 ID: WRITE1
- 관련 API: `POST /posts`
- 관련 Table: posts

## Test4: Insert data to Two Table

한 개의 테이블에 데이터를 입력하고 한 개의 테이블에 정보를 업데이트하여 처리되는 api 성능을 측정한다.

- 테스트 ID: WRITE2
- 관련 API: `POST /posts/:post/post-replies`
- 관련 Table: posts, replies
