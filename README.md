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

Let me know if you have any issues! 🚀
