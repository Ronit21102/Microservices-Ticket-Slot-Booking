# Microservices-Ticket-Slot-Booking
![image](https://github.com/user-attachments/assets/b2debbef-9545-485a-8b0f-3c2141e02cf2)
![image](https://github.com/user-attachments/assets/0b02ea6b-7691-4ac0-83f9-116091184f33)

![image](https://github.com/user-attachments/assets/da4db64f-15c5-4ce7-b0bd-b6aebfd79902)

Yes, you got it! Here’s a breakdown of how everything connects in your **Google Kubernetes Engine (GKE) setup**:

---

### **1️⃣ Load Balancer (External Traffic Entry Point)**
- When you created your **Kubernetes cluster**, GKE automatically provisioned a **Load Balancer**.
- This Load Balancer gets a **public IP address**, which external users can use to access your application.
- It forwards traffic to the **Ingress Controller**.

✅ **Example:**  
Public IP: `35.200.150.30`  
User accesses: `http://35.200.150.30`

---

### **2️⃣ Ingress Controller (Traffic Routing Inside the Cluster)**
- The **Ingress Controller** (which you deployed using the `kubectl apply -f` command) manages how traffic is routed within the cluster.
- It **checks the URL paths & domains** and directs requests to the correct **Kubernetes Service**.

✅ **Example Ingress Rule (inside your cluster)**  
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
spec:
  rules:
  - host: myapp.example.com  # (Optional: If using domain)
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```
**What happens here?**
- `http://35.200.150.30/api` → Routes to `backend-service`
- `http://35.200.150.30/` → Routes to `frontend-service`

---

### **3️⃣ Service (Connecting Ingress to Pods)**
- A **Service** exposes a set of **Pods** running the application.
- Ingress sends traffic to the **Service**, which then forwards it to the correct **Pods**.

✅ **Example Service (inside your cluster)**  
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```
- This **routes traffic from the Ingress** to any **Pods labeled `app: backend`**.

---

### **4️⃣ Pods & Containers (Running Your App)**
- A **Pod** is a small unit in Kubernetes that runs your **Docker container**.
- The **Service routes traffic to the correct Pod(s)**.

✅ **Example Deployment (running the container inside a Pod)**  
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: my-backend-image:latest
        ports:
        - containerPort: 8080
```
- **Pods are created from this Deployment**.
- **Service finds the Pods** using the label `app: backend`.
- **Traffic flows from Load Balancer → Ingress → Service → Pod**.

---

### **🚀 Full Traffic Flow**
1️⃣ **User Requests:** `http://35.200.150.30/api`  
2️⃣ **Load Balancer:** Forwards request to **Ingress Controller**.  
3️⃣ **Ingress Controller:** Matches `/api` path → Sends request to `backend-service`.  
4️⃣ **Service (`backend-service`)**: Routes request to **Pods running the backend container**.  
5️⃣ **Pod (`backend-deployment`)**: Runs the actual **backend application inside a container**.

---

### **✅ Final Answer**
Yes! The **Load Balancer** creates an external **IP**.  
👉 Then, the **Ingress Controller** routes traffic to different **Services**.  
👉 The **Services** forward traffic to **Pods running your containerized application**.  

Now, you can:
- Use the **Load Balancer’s IP** (`http://35.200.150.30`) to test your app.
- Use a **domain name** (by pointing DNS to your Load Balancer).
- Check logs with:
  ```bash
  kubectl logs -l app=backend
  ```
- View all services:
  ```bash
  kubectl get svc
  ```

### **🔍 What is `Object.setPrototypeOf(this, CustomError.prototype);` and Why Do We Need It?**

In JavaScript (and TypeScript), **when you extend the `Error` class**, you must manually fix the prototype chain using:

```ts
Object.setPrototypeOf(this, CustomError.prototype);
```
This ensures that **instances of `CustomError` behave correctly as subclasses of `Error`**.

---

## **1️⃣ The Problem with Extending `Error`**
Normally, when you extend a class, JavaScript **automatically sets the prototype** so that `instanceof` checks work:

```ts
class Parent {}
class Child extends Parent {}

const obj = new Child();
console.log(obj instanceof Child); // ✅ true
console.log(obj instanceof Parent); // ✅ true
```

However, when extending **built-in classes like `Error`**, **JavaScript does not correctly set the prototype chain**.  

For example, without `Object.setPrototypeOf`, this happens:

```ts
class CustomError extends Error {
  constructor() {
    super("Something went wrong");
  }
}

const err = new CustomError();
console.log(err instanceof CustomError); // ❌ false (unexpected behavior!)
console.log(err instanceof Error); // ✅ true
```

🚨 **Why?**  
- `super("Something went wrong")` correctly calls the `Error` constructor.
- But the prototype chain **doesn’t properly link `CustomError` to `Error`**.
- This means `instanceof CustomError` **fails**, breaking error handling logic.

---

## **2️⃣ Fixing the Prototype Chain with `Object.setPrototypeOf`**
To fix this, we manually set the prototype **after calling `super()`**:

```ts
class CustomError extends Error {
  constructor() {
    super("Something went wrong");

    // 🔹 Manually set the prototype to fix instanceof behavior
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

const err = new CustomError();
console.log(err instanceof CustomError); // ✅ true (now it works!)
console.log(err instanceof Error); // ✅ true
```

Now, `CustomError` behaves like a **true subclass of `Error`**, and `instanceof` works correctly.

---

## **3️⃣ Why is This Important for `CustomError`?**
Your `CustomError` class is an **abstract base class** for all custom errors:

```ts
export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype); // 🔥 Fix prototype chain
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
```

- **Why Use `abstract`?**  
  - Forces child classes to implement `serializeErrors()`, ensuring consistency across all error types.

- **Why Use `Object.setPrototypeOf`?**  
  - Ensures that `instanceof` checks work correctly when catching errors in middleware.

---

## **4️⃣ Real-World Use Case**
Let’s say you have multiple error types extending `CustomError`:

### ✅ **`RequestValidationError.ts`**
```ts
import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(err => ({ message: err.msg, field: err.param }));
  }
}
```

### ✅ **`DatabaseConnectionError.ts`**
```ts
import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = "Error connecting to database";

  constructor() {
    super("Database connection failed");

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
```

### ✅ **Express Error Handler Middleware**
```ts
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(500).send({ errors: [{ message: "Something went wrong" }] });
};
```

---

## **5️⃣ What Happens Without `Object.setPrototypeOf`?**
If we **don’t** set the prototype manually, `instanceof` fails:

```ts
const err = new RequestValidationError([]);
console.log(err instanceof RequestValidationError); // ❌ false
console.log(err instanceof CustomError); // ❌ false
```

This means **Express middleware won’t recognize the error correctly**, and generic error handling would be used instead.

---

## **🚀 Summary**
| **Concept** | **Why It Matters?** |
|------------|----------------|
| **Extending `Error` is Broken in JS** | JavaScript doesn’t correctly set prototypes for built-in classes like `Error`. |
| **`Object.setPrototypeOf(this, CustomError.prototype);`** | Fixes `instanceof` checks, ensuring errors work correctly. |
| **Abstract Class `CustomError`** | Forces child errors (`RequestValidationError`, etc.) to implement `serializeErrors()`. |
| **Error Middleware Uses `instanceof`** | Without fixing the prototype, Express middleware won’t recognize custom errors. |

Now, your **error handling is consistent and properly structured**! 🚀

### **Why is TypeScript Saying `NotFoundError` is Missing `statusCode` and `serializeErrors`?**  

The error is happening because **`CustomError` is an abstract class** and requires all subclasses to implement:  
1. **`statusCode`** (a number).  
2. **`serializeErrors()`** (a method returning an array of error objects).  

Since `NotFoundError` **extends `CustomError` but does not define these properties/methods**, TypeScript throws an error.

---

### **🔧 Fix: Implement Required Properties and Methods**
You must **define `statusCode` and `serializeErrors()`** in `NotFoundError`:

```ts
import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404; // ✅ Required property

  constructor() {
    super("Route not found");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: "Not Found" }]; // ✅ Required method
  }
}
```

---

### **🔍 Why is This Required?**
#### **1️⃣ `CustomError` is Abstract**
```ts
export abstract class CustomError extends Error {
  abstract statusCode: number; // ❗ Must be implemented in subclasses
  abstract serializeErrors(): { message: string; field?: string }[]; // ❗ Must be implemented

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
```
- The `abstract` keyword **forces subclasses to implement these properties/methods**.
- Since `NotFoundError` extends `CustomError`, it **must** implement `statusCode` and `serializeErrors()`.

---

### **🚀 Summary**
| **Issue** | **Fix** |
|----------|--------|
| `NotFoundError` extends `CustomError` but doesn't implement `statusCode` or `serializeErrors()` | Add `statusCode = 404;` and `serializeErrors() { return [{ message: "Not Found" }]; }` |
| `CustomError` is an abstract class | All child classes **must** implement abstract methods/properties |

### **Understanding `statics` and `methods` in Mongoose**
In Mongoose, you can define **custom functions** on your models using **`statics`** and **`methods`**, but they work in different ways.

---

## **1️⃣ What is the Difference Between `statics` and `methods`?**
| Feature | `statics` (Model-Level) | `methods` (Instance-Level) |
|---------|----------------|----------------|
| **Works On** | The **entire model (collection)** | A **single document (instance)** |
| **Use Case** | Operations that query the **whole collection** (e.g., find users by email) | Operations that work on **one document** (e.g., hash a user's password) |
| **Example Call** | `User.findByEmail("test@example.com")` | `user.getFullName()` |

---

## **2️⃣ Example of `statics` (Used on the Model)**
🔹 **Use case:** Find a user by email.

```ts
import mongoose from "mongoose";

// Define a User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// 🔹 Define a static method (works on the model)
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }); // `this` refers to the Model
};

// Create the User model
const User = mongoose.model("User", userSchema);

// 🔹 Using the static method
const user = await User.findByEmail("test@example.com");
console.log(user);
```

✅ **Why Use `statics`?**  
- This method **operates on the entire model (`User`)** and does not need a specific document.
- `User.findByEmail("test@example.com")` works directly on the **Model** (not on an instance).

---

## **3️⃣ Example of `methods` (Used on a Document)**
🔹 **Use case:** Get the full name of a user.

```ts
import mongoose from "mongoose";

// Define a User schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }
});

// 🔹 Define an instance method (works on a document)
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`; // `this` refers to the document
};

// Create the User model
const User = mongoose.model("User", userSchema);

// 🔹 Using the instance method
const user = await User.findOne();
console.log(user.getFullName()); // ✅ "John Doe"
```

✅ **Why Use `methods`?**  
- `methods` are used **on a specific document** (not the entire model).  
- `user.getFullName()` is **called on an instance**, meaning you must first retrieve a user before calling this method.

---

## **4️⃣ Key Differences in How They Are Used**
| Feature | `statics` (Model-Level) | `methods` (Instance-Level) |
|---------|----------------|----------------|
| **What `this` Refers To** | The **Model** (e.g., `User`) | A **single Document** (e.g., `user`) |
| **Example Function** | `findByEmail(email: string)` | `getFullName()` |
| **How to Call It** | `User.findByEmail("test@example.com")` | `user.getFullName()` |
| **Use Case** | Finding users, counting documents | Formatting data, hashing passwords |

---

## **5️⃣ Real-World Use Cases**
✅ **Using `statics` for Authentication**
```ts
userSchema.statics.authenticate = async function (email: string, password: string) {
  const user = await this.findOne({ email });
  if (!user) return null;
  
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
};
```
🔹 **Usage:**  
```ts
const loggedInUser = await User.authenticate("test@example.com", "password123");
```

✅ **Using `methods` for Hashing a Password**
```ts
userSchema.methods.hashPassword = async function () {
  this.password = await bcrypt.hash(this.password, 10);
};
```
🔹 **Usage:**  
```ts
const user = new User({ email: "test@example.com", password: "mypassword" });
await user.hashPassword();
await user.save();
```

---

## **🚀 Summary**
| Feature | `statics` (Model-Level) | `methods` (Instance-Level) |
|---------|----------------|----------------|
| **Works On** | The **entire model (collection)** | A **single document (instance)** |
| **Use Case** | Finding users, authentication | Hashing passwords, formatting data |
| **How to Call It** | `User.findByEmail("test@example.com")` | `user.getFullName()` |

### **What are Generics in TypeScript?**  
**Generics** in TypeScript **allow you to create reusable, type-safe components and functions** that work with multiple types instead of a single specific type.

---

## **1️⃣ Why Do We Need Generics?**
Let's say you want a function that **returns the first element** of an array.  

Without generics, you might write:
```ts
function getFirstElement(arr: any[]): any {
  return arr[0];
}

const num = getFirstElement([1, 2, 3]); // num is of type `any`
console.log(num.toUpperCase()); // ❌ No type safety (runtime error!)
```
🔹 The return type is `any`, meaning **TypeScript cannot prevent errors** like calling `toUpperCase()` on a number.

✅ **With Generics:**
```ts
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

const num = getFirstElement<number>([1, 2, 3]); // num is of type `number`
const str = getFirstElement<string>(["hello", "world"]); // str is `string`
```
🔹 Now, TypeScript knows the exact type of the return value!

---

## **2️⃣ How to Use Generics in Functions**
### **Example 1: Generic Function**
```ts
function identity<T>(value: T): T {
  return value;
}

console.log(identity<number>(42)); // ✅ 42 (Type: number)
console.log(identity<string>("Hello")); // ✅ "Hello" (Type: string)
```
✅ The function **preserves the type of the input** and ensures type safety.

---

## **3️⃣ Generics in Interfaces**
You can use generics in **interfaces** to make them flexible.

```ts
interface Box<T> {
  value: T;
}

const stringBox: Box<string> = { value: "TypeScript" };
const numberBox: Box<number> = { value: 100 };
```
🔹 Now, `Box<T>` can hold **any type** while keeping type safety.

---

## **4️⃣ Generics in Classes**
You can also create **generic classes**:

```ts
class Storage<T> {
  private data: T[] = [];

  add(item: T) {
    this.data.push(item);
  }

  getAll(): T[] {
    return this.data;
  }
}

const numberStorage = new Storage<number>();
numberStorage.add(10);
numberStorage.add(20);
console.log(numberStorage.getAll()); // ✅ [10, 20]

const stringStorage = new Storage<string>();
stringStorage.add("Hello");
console.log(stringStorage.getAll()); // ✅ ["Hello"]
```
🔹 **Why Use Generics?**
- `Storage<T>` **works for any data type**.
- TypeScript **enforces type safety**.

---

## **5️⃣ Generics with Multiple Types**
You can have multiple **generic types**:

```ts
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const p = pair<string, number>("age", 30);
console.log(p); // ✅ ["age", 30]
```
🔹 Here, `K` and `V` allow different types for **key-value pairs**.

---

## **🚀 Summary**
| Feature | Example |
|---------|---------|
| **Generic Function** | `function identity<T>(value: T): T { return value; }` |
| **Generic Interface** | `interface Box<T> { value: T; }` |
| **Generic Class** | `class Storage<T> { private data: T[] = []; }` |
| **Multiple Generics** | `function pair<K, V>(key: K, value: V): [K, V]` |

Generics **make TypeScript more flexible and reusable** while ensuring **type safety**. 🚀  
Yes, if you're doing **server-side rendering (SSR)**, the **JWT token must already be set in cookies** so that it is sent automatically with each request.  

---

### **How JWT Works with SSR**
Since SSR runs on the **server** (e.g., in Next.js or Express), the server itself makes the request **before sending the page to the client**. The JWT token must be available in the cookies for the server to authenticate the user.

✅ **Typical SSR Flow:**
1. User requests a page (`/dashboard`).
2. The **server processes the request**.
   - It **reads the JWT** from the request cookies.
   - It **validates the JWT** (or refreshes it if expired).
   - It **fetches data** from the backend using the JWT.
3. The server **renders the page** with the fetched data and sends it to the browser.

---

### **Why Cookies are Required for JWT in SSR**
- Since **SSR runs on the server**, **there is no browser `localStorage` or `sessionStorage`**.
- The browser **automatically sends cookies** with every request, so the JWT can be accessed in the request headers.

🔹 **Example in Next.js (getServerSideProps)**
```javascript
import { parseCookies } from "nookies";

export async function getServerSideProps(context) {
  const cookies = parseCookies(context);
  const token = cookies.jwt; // Get JWT from cookies

  if (!token) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  // Fetch data with token
  const res = await fetch("https://api.example.com/data", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  return { props: { data } };
}
```

---

### **But Do We Still Need an Interceptor?**
**Yes, but for client-side API calls!**  
Even if the server gets the JWT from cookies during SSR, once the page is loaded in the browser:
- The frontend still needs to make authenticated API requests.
- An **interceptor can handle expired tokens** (e.g., refreshing them when needed).
- It can **add custom headers, retry failed requests, and handle errors centrally**.

🔹 **Example: Using Axios Interceptor for Client-Side Requests**
```javascript
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://api.example.com",
  withCredentials: true, // Ensures cookies are sent with requests
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

### **🚀 TL;DR**
✅ **SSR requires JWT in cookies** (because there's no `localStorage`).  
✅ **The server reads JWT from cookies and validates it before fetching data.**  
✅ **Interceptors are still needed for client-side requests** (e.g., refreshing tokens, error handling, adding headers).  

👉 **If your JWT is short-lived, you'll still need an API to refresh tokens in the background!**
