
var http = require('http').createServer()
const io = require("socket.io")(http);
http.listen(7000, function () {
  console.log("run server on 7000 port")
})

const words = ["라면짱", "고드름", "백과사전", "누가바", "백두산", "부엉이", "패스트푸드",
  "피자", "노트북", "해바라기", "장수풍뎅이", "대표이사", "삼각김밥", "파인애플", "손목시계",
  "김밥천국", "돌아이", "팥빙수", "비자금", "무죄", "형사", "바다사자", "사이트", "장기", "오목",
  "야구", "바위", "파출소", "기사식당", "배탈", "국밥", "불가사리", "해파리", "트럼프", "반달가슴곰",
  "소주", "크리스마스", "선풍기", "난로", "돼지", "황소", "인디언", "롱패딩", "사과", "게스트하우스",
  "여드름", "아이라이너", "무술", "콩고물", "무말랭이", "연장전", "죽부인", "부동산", "블랙박스",
  "듣기평가", "유언비어", "가루약"];

var roomNumber = [];
var rooms = [];

count = 0;

function rWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function randomWord() {
  var items = [];
  for (let i = 0; i < 6; i++) {
    items[i] = rWord();
    for (let j = 0; j < i; j++) {
      if (items[i] === items[j]) {
        i--;
      }
    }
  }
  console.log(items);
  return items;
}

function searchRoom() {
  for (let i = 0; i < 100; i++) {
    if (roomNumber[i] === null || roomNumber[i] === undefined) {
      roomNumber[i] = i;
      return roomNumber[i];
    }
  }
}

var room = {
  name: null,
  count: 0,
  solver: null,
  drawer: null,
  words: null,
  round: 0
};

var info = {
  count: 0,
  num: null
};

io.on("connection", function (socket) {
  console.log("cnt: " + info.count);

  if (info.count >= 1) {
    info.count = 0;
    socket.join(rooms[info.num].name);
    rooms[info.num].solver = socket;
    rooms[info.num].words = randomWord();
    console.log("solver: " + rooms[info.num].solver.id);
    info.num = null;
  } else {
    info.num = searchRoom();
    tempRoom = new Object(room);
    tempRoom.name = String(info.num);
    tempRoom.drawer = socket;
    rooms[info.num] = tempRoom;
    socket.join(rooms[info.num].name);
    console.log("drawer: " + rooms[info.num].drawer);
    info.count = 1;
  }

  socket.on("ready", function () {
    var tempRoom = rooms[Number(Object.keys(socket.rooms)[0]).id];
    tempRoom.drawer.emit("start", true);
    tempRoom.solver.emit("start", false);
  });

  socket.on("roundStart", function () {
    var tempRoom = rooms[Number(Object.keys(socket.rooms)[0])];
    io.sockets
      .in(tempRoom.name)
      .emit("wordData", tempRoom.words[tempRoom.round]);
    tempRoom.round++;
  });

  socket.on("action", function (data) {
    var tempRoom = rooms[Number(Object.keys(socket.rooms)[0])];
    socket.broadcast.to(tempRoom.name).emit("action", data);
  });

  socket.on("pass", function () {
    var tempRoom = rooms[Number(Object.keys(socket.rooms)[0])];
    var tempClient = tempRoom.drawer;
    tempRoom.drawer = tempRoom.solver;
    tempRoom.solver = tempClient;
    console.log(tempRoom.drawer.id, tempRoom.solver.id);
    io.sockets.in(tempRoom.name).emit("pass");
  });

  socket.on("disconnect", function () {
    var tempNum = Number(Object.keys(socket.rooms)[0]);
    roomNumber[tempNum] = null;
    rooms[tempNum] = null;
  });
});
