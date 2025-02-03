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

Now, TypeScript will be happy! 🎉 Let me know if you need more clarification. 🚀
