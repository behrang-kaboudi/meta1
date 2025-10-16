let a: number = 5;
console.log("tsssss", a);
export {};

interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
};

console.log("User:", user);

// اضافه کردن enum برای اینکه Node.js نتواند مستقیماً اجرا کند
enum Status {
  Active = "active",
  Inactive = "inactive",
}

const status: Status = Status.Active;
console.log("Status:", status);
module.exports = { Status };
