# **TP KUBERNETES / DEVOPS - GUIDE COMPLET**

## 📋 **Table des Matières**
1. [Présentation](#présentation)
2. [Prérequis](#prérequis)
3. [Installation sur Kali Linux](#installation-sur-kali-linux)
4. [TP 1 - Première Application Nginx](#tp-1---première-application-nginx)
5. [TP 2 - Manifests YAML](#tp-2---manifests-yaml)
6. [TP 3 - Services Kubernetes](#tp-3---services-kubernetes)
7. [TP 4 - Application Node.js + MySQL](#tp-4---application-nodejs--mysql)
8. [Commandes Utiles](#commandes-utiles)
9. [Dépannage](#dépannage)
10. [Livrables](#livrables)

---

## 🎯 **Présentation**

Ce projet contient une série de Travaux Pratiques (TP) pour maîtriser Kubernetes dans un contexte DevOps. Les TP progressent de la configuration de base au déploiement d'une application complète avec base de données.

**Objectifs généraux :**
- Comprendre le rôle de Kubernetes dans un workflow DevOps
- Déployer et gérer des Pods, Deployments, Services
- Comprendre et créer des manifests YAML
- Exposer des applications via NodePort / Ingress
- Orchestrer plusieurs services (Node.js, MySQL, Redis)
- Mettre en place un début de monitoring

---

## ⚙️ **Prérequis**

### **Pour Kali Linux :**
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Outils de base
sudo apt install -y curl wget git vim net-tools
```

### **Matériel minimal :**
- 2 Go de RAM minimum
- 20 Go d'espace disque libre
- Connexion Internet

---

## 🚀 **Installation sur Kali Linux**

### **1. Installation de Docker**
```bash
# Installation
sudo apt install docker.io -y

# Démarrer et activer Docker
sudo systemctl start docker
sudo systemctl enable docker

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session OU exécuter
newgrp docker

# Vérification
docker --version
```

### **2. Installation de kubectl**
```bash
# Téléchargement de kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Installation
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Vérification
kubectl version --client
```

### **3. Installation de Minikube**
```bash
# Téléchargement
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Installation
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Démarrer Minikube
minikube start --driver=docker

# Vérification
minikube status
kubectl get nodes
```

### **4. Configuration de l'environnement**
```bash
# Vérifier que tout fonctionne
kubectl cluster-info

# Activer les addons utiles
minikube addons enable dashboard
minikube addons enable metrics-server
```

---

## 📚 **TP 1 - Première Application Nginx**

### **Objectifs :**
- Comprendre Pod vs Container
- Lancer un Pod à partir d'une image du registry
- Exposer une application dans un navigateur
- Utiliser kubectl run, get pods, port-forward

### **Étapes :**

#### **1. Lancer un Pod Nginx**
```bash
kubectl run web --image=nginx:latest
```

#### **2. Vérifier le Pod**
```bash
# Lister les pods
kubectl get pods

# Détails du pod
kubectl describe pod web

# Voir les logs
kubectl logs web
```

#### **3. Rediriger le port (port-forward)**
```bash
# Port-forward du port 8080 local vers le port 80 du pod
kubectl port-forward pod/web 8080:80
```
**Accès :** http://localhost:8080

#### **4. Supprimer le Pod**
```bash
kubectl delete pod web
```

### **Commandes pour ce TP :**
```bash
# Script complet TP1
#!/bin/bash
echo "🚀 Début TP1 - Nginx"
kubectl run web --image=nginx:latest
sleep 10
kubectl get pods
kubectl port-forward pod/web 8080:80 &
sleep 5
curl http://localhost:8080
kubectl delete pod web
echo "✅ TP1 terminé"
```

### **Compétences acquises :**
- ✔ Différence image / conteneur / pod
- ✔ Lancer un Pod avec kubectl run
- ✔ Port-forwarding
- ✔ Lecture de base avec kubectl describe

---

## 📝 **TP 2 - Manifests YAML**

### **Objectifs :**
- Comprendre un fichier YAML Kubernetes
- Utiliser kubectl apply
- Versionner un déploiement

### **Étapes :**

#### **1. Créer la structure**
```bash
mkdir tp2 && cd tp2
```

#### **2. Créer le fichier `nginx-deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

#### **3. Appliquer le manifest**
```bash
kubectl apply -f nginx-deployment.yaml
```

#### **4. Vérifier le déploiement**
```bash
kubectl get deployments
kubectl get pods
```

#### **5. Exposer via un NodePort**
```bash
kubectl expose deployment nginx-depl --port=80 --type=NodePort
```

#### **6. Obtenir l'URL d'accès**
```bash
# Obtenir le NodePort
kubectl get svc nginx-depl

# Avec Minikube
minikube service nginx-depl --url
```

### **Commandes pour ce TP :**
```bash
# Script complet TP2
#!/bin/bash
echo "🚀 Début TP2 - YAML Manifests"
cat > nginx-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
EOF

kubectl apply -f nginx-deployment.yaml
sleep 5
kubectl get deployments
kubectl expose deployment nginx-depl --port=80 --type=NodePort
minikube service nginx-depl --url
echo "✅ TP2 terminé"
```

### **Compétences acquises :**
- ✔ Création de fichiers YAML Kubernetes
- ✔ Utilisation de kubectl apply
- ✔ Gestion des Deployments
- ✔ Exposition via NodePort

---

## 🔗 **TP 3 - Services Kubernetes**

### **Objectifs :**
- Créer un Service Kubernetes
- Comprendre ClusterIP, NodePort, LoadBalancer
- Accéder à une application depuis un navigateur

### **Étapes :**

#### **1. Préparation**
```bash
# Créer un deployment Nginx s'il n'existe pas
kubectl create deployment nginx --image=nginx
```

#### **2. Service ClusterIP (interne)**
```bash
# Créer un service ClusterIP
kubectl expose deployment nginx --port=80 --name=nginx-clusterip

# Vérifier
kubectl get svc nginx-clusterip
```
**Note :** Accessible uniquement depuis le cluster.

#### **3. Service NodePort (accès externe)**
```bash
# Supprimer le service ClusterIP
kubectl delete svc nginx-clusterip

# Créer un service NodePort
kubectl expose deployment nginx --port=80 --type=NodePort --name=nginx-nodeport

# Vérifier
kubectl get svc nginx-nodeport
```
**Accès :** http://localhost:<NodePort>

#### **4. Service LoadBalancer (Docker Desktop/Minikube)**
```bash
# Créer un service LoadBalancer
kubectl expose deployment nginx --port=80 --type=LoadBalancer --name=nginx-lb

# Vérifier
kubectl get svc nginx-lb

# Avec Minikube
minikube service nginx-lb
```

### **Tableau Comparatif des Services :**

| Type | Port | Accès | Utilisation |
|------|------|-------|-------------|
| ClusterIP | 80 | Interne uniquement | Communication entre pods |
| NodePort | 30000-32767 | Externe via IP:Port | Tests, démonstrations |
| LoadBalancer | 80 | Externe via IP | Production cloud |

### **Quiz TP3 :**

**Partie A — QCM (une seule bonne réponse)**

1. **À quoi sert un Service Kubernetes ?**
   - B. Donner une IP stable à des Pods

2. **Quel type de Service est accessible uniquement à l'intérieur du cluster ?**
   - C. ClusterIP

3. **En local Windows, quel Service est le plus simple pour accéder à une application depuis un navigateur**
   - B. NodePort

4. **Quelle commande permet d'exposer un Deployment en NodePort ?**
   - C. kubectl expose

5. **Quel port utilise un Service NodePort ?**
   - C. Entre 30000 et 32767

### **Commandes pour ce TP :**
```bash
# Script complet TP3
#!/bin/bash
echo "🚀 Début TP3 - Services Kubernetes"

# ClusterIP
kubectl expose deployment nginx --port=80 --name=nginx-clusterip
echo "🔹 ClusterIP créé"

# NodePort
kubectl delete svc nginx-clusterip
kubectl expose deployment nginx --port=80 --type=NodePort --name=nginx-nodeport
NODE_PORT=$(kubectl get svc nginx-nodeport -o jsonpath='{.spec.ports[0].nodePort}')
echo "🔹 NodePort: $NODE_PORT"

# LoadBalancer
kubectl expose deployment nginx --port=80 --type=LoadBalancer --name=nginx-lb
echo "🔹 LoadBalancer créé"

# Affichage
kubectl get svc
echo "✅ TP3 terminé"
```

---

## 🏗️ **TP 4 - Application Node.js avec MySQL**

### **Objectifs :**
- Déployer une application Node.js dans Kubernetes
- Déployer une base de données MySQL
- Comprendre la communication Service → Service
- Utiliser les variables d'environnement

### **Architecture :**
```
[ Navigateur ]
     ↓
http://<IP>:30001 (NodePort)
     ↓
[ Service Node.js ]
     ↓
[ Pod Node.js ]
     ↓ (DB_HOST=mysql-service)
[ Service MySQL (ClusterIP) ]
     ↓
[ Pod MySQL ]
```

### **Étapes Complètes :**

#### **Étape 1 : Préparer l'environnement**
```bash
# Créer le répertoire principal
mkdir -p ~/tp4-k8s && cd ~/tp4-k8s

# Utiliser le Docker daemon de Minikube
eval $(minikube docker-env)
```

#### **Étape 2 : Créer l'application Node.js**
```bash
# Créer le dossier de l'application
mkdir node-app && cd node-app
```

**Fichier `package.json` :**
```json
{
  "name": "node-mysql-app",
  "version": "1.0.0",
  "description": "Application Node.js connectée à MySQL",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0"
  }
}
```

**Fichier `app.js` :**
```javascript
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql-service',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'testdb',
  port: process.env.DB_PORT || 3306
});

app.get('/', (req, res) => {
  db.query('SELECT NOW() as time', (err, result) => {
    if (err) {
      res.status(500).send('Erreur DB: ' + err.message);
    } else {
      res.send(`
        <h1>🚀 Application Node.js + MySQL</h1>
        <p><strong>Connexion MySQL OK !</strong></p>
        <p>Heure serveur MySQL: ${result[0].time}</p>
        <p>Host: ${process.env.DB_HOST}</p>
        <p>Base: ${process.env.DB_NAME}</p>
      `);
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'node-app', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Serveur Node.js démarré sur le port ${PORT}`);
});
```

**Fichier `Dockerfile` :**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

#### **Étape 3 : Construire l'image Docker**
```bash
# Construire l'image
docker build -t node-mysql-app:latest .

# Vérifier l'image
docker images | grep node-mysql-app
```

#### **Étape 4 : Créer les fichiers YAML**
Retour au répertoire principal :
```bash
cd ~/tp4-k8s
```

**Fichier `mysql-deployment.yaml` :**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-deployment
  labels:
    app: mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:5.7
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "root"
        - name: MYSQL_DATABASE
          value: "testdb"
        ports:
        - containerPort: 3306
```

**Fichier `mysql-service.yaml` :**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
spec:
  selector:
    app: mysql
  ports:
    - port: 3306
      targetPort: 3306
  type: ClusterIP
```

**Fichier `node-deployment.yaml` :**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-deployment
  labels:
    app: node-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node-app
  template:
    metadata:
      labels:
        app: node-app
    spec:
      containers:
      - name: node-app
        image: node-mysql-app:latest
        imagePullPolicy: Never
        env:
        - name: DB_HOST
          value: "mysql-service"
        - name: DB_USER
          value: "root"
        - name: DB_PASSWORD
          value: "root"
        - name: DB_NAME
          value: "testdb"
        ports:
        - containerPort: 3000
```

**Fichier `node-service.yaml` :**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: node-service
spec:
  selector:
    app: node-app
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30001
  type: NodePort
```

#### **Étape 5 : Déployer sur Kubernetes**
```bash
# Déployer MySQL
kubectl apply -f mysql-deployment.yaml
kubectl apply -f mysql-service.yaml

# Attendre que MySQL soit prêt
sleep 15

# Déployer Node.js
kubectl apply -f node-deployment.yaml
kubectl apply -f node-service.yaml

# Vérifier
kubectl get all
```

#### **Étape 6 : Tester l'application**
```bash
# Méthode 1: Port-forward
kubectl port-forward service/node-service 8080:3000
# Accès: http://localhost:8080

# Méthode 2: Via NodePort
MINIKUBE_IP=$(minikube ip)
echo "URL: http://$MINIKUBE_IP:30001"

# Méthode 3: Via minikube service
minikube service node-service --url
```

#### **Étape 7 : Vérifications**
```bash
# Vérifier les logs
kubectl logs -l app=node-app
kubectl logs -l app=mysql

# Tester la connexion MySQL
kubectl exec -it $(kubectl get pod -l app=mysql -o name) -- mysql -uroot -proot -e "SHOW DATABASES;"

# Vérifier les variables d'environnement
kubectl exec -it $(kubectl get pod -l app=node-app -o name) -- env | grep DB_
```

### **Script complet TP4 :**
```bash
#!/bin/bash
echo "🚀 Début TP4 - Node.js + MySQL"

# Nettoyer l'environnement
kubectl delete all --all

# Construire l'image
cd node-app
docker build -t node-mysql-app:latest .
cd ..

# Déployer MySQL
echo "🔧 Déploiement MySQL..."
kubectl apply -f mysql-deployment.yaml
kubectl apply -f mysql-service.yaml
sleep 20

# Déployer Node.js
echo "🔧 Déploiement Node.js..."
kubectl apply -f node-deployment.yaml
kubectl apply -f node-service.yaml
sleep 10

# Vérifier
echo "📊 État du cluster:"
kubectl get all

# Obtenir l'URL
echo "🌐 URL d'accès:"
MINIKUBE_IP=$(minikube ip)
echo "http://$MINIKUBE_IP:30001"
echo "✅ TP4 terminé"
```

---

## 🛠️ **Commandes Utiles**

### **Commandes kubectl essentielles :**
```bash
# Informations générales
kubectl cluster-info
kubectl version
kubectl get componentstatuses

# Gestion des ressources
kubectl get all
kubectl get pods,svc,deployments
kubectl get pods -o wide
kubectl get pods -w  # Watch mode

# Détails
kubectl describe pod <pod-name>
kubectl describe service <service-name>
kubectl describe deployment <deployment-name>

# Logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Follow logs
kubectl logs --tail=50 <pod-name>

# Exécution de commandes
kubectl exec -it <pod-name> -- /bin/sh
kubectl exec <pod-name> -- env

# Suppression
kubectl delete pod <pod-name>
kubectl delete deployment <deployment-name>
kubectl delete service <service-name>
kubectl delete -f fichier.yaml
```

### **Commandes Minikube :**
```bash
# Gestion de Minikube
minikube start --driver=docker
minikube stop
minikube delete
minikube status

# Services
minikube service list
minikube service <service-name> --url

# Dashboard
minikube dashboard

# Addons
minikube addons list
minikube addons enable dashboard
minikube addons enable ingress
```

### **Commandes Docker :**
```bash
# Images
docker images
docker build -t nom-image:tag .
docker rmi <image-id>

# Minikube Docker
eval $(minikube docker-env)  # Utiliser le Docker de Minikube
docker ps
```

---

## 🔧 **Dépannage**

### **Problèmes courants et solutions :**

#### **1. Pod en état "ContainerCreating" ou "Pending"**
```bash
# Vérifier les détails
kubectl describe pod <pod-name>

# Vérifier les événements
kubectl get events --sort-by='.lastTimestamp'

# Vérifier les nœuds
kubectl get nodes
kubectl describe node minikube
```

#### **2. Erreurs de téléchargement d'image**
```bash
# Télécharger manuellement l'image
minikube ssh "docker pull nginx:alpine"

# Vérifier l'espace disque
minikube ssh "df -h"

# Nettoyer les images
minikube ssh "docker system prune -a"
```

#### **3. Service non accessible**
```bash
# Vérifier le service
kubectl get svc
kubectl describe svc <service-name>

# Tester depuis l'intérieur du cluster
kubectl run test --image=busybox -it --rm -- sh
# Dans le shell: wget -O- <service-name>:<port>

# Vérifier les endpoints
kubectl get endpoints <service-name>
```

#### **4. Node.js ne se connecte pas à MySQL**
```bash
# Vérifier la résolution DNS
kubectl exec -it <node-pod> -- nslookup mysql-service

# Tester la connexion réseau
kubectl exec -it <node-pod> -- nc -zv mysql-service 3306

# Vérifier les logs MySQL
kubectl logs -l app=mysql

# Redémarrer MySQL
kubectl rollout restart deployment/mysql-deployment
```

#### **5. Tout réinitialiser**
```bash
# Supprimer toutes les ressources
kubectl delete all --all
kubectl delete pvc --all

# Redémarrer Minikube
minikube stop
minikube delete
minikube start --driver=docker
```

---

## 📖 **Glossaire**

| Terme | Définition |
|-------|------------|
| **Pod** | Plus petite unité déployable dans Kubernetes |
| **Deployment** | Gère le déploiement et la mise à jour des Pods |
| **Service** | Point d'accès stable à un groupe de Pods |
| **ClusterIP** | Service accessible uniquement dans le cluster |
| **NodePort** | Service exposé sur un port de chaque nœud |
| **LoadBalancer** | Service avec IP externe (cloud) |
| **Namespace** | Partition logique du cluster |
| **kubectl** | CLI pour interagir avec Kubernetes |
| **Minikube** | Outil pour exécuter Kubernetes en local |

---

## 🎓 **Conclusion**

Ce guide complet vous permet de maîtriser les bases de Kubernetes pour le DevOps. Vous apprendrez à :

1. **Configurer un environnement Kubernetes** sur Kali Linux
2. **Déployer des applications simples** avec Nginx
3. **Créer et gérer des manifests YAML**
4. **Comprendre les différents types de Services**
5. **Orchestrer une application complète** Node.js + MySQL
6. **Résoudre les problèmes courants**

### **Prochaines étapes :**
- Ajouter Redis comme cache
- Mettre en place Ingress pour le routage HTTP
- Configurer des Volumes persistants
- Automatiser avec CI/CD (GitHub Actions)
- Implémenter le monitoring avec Prometheus/Grafana

---

## 📞 **Support**

En cas de problème :
1. Vérifiez les logs avec `kubectl logs`
2. Consultez les événements avec `kubectl get events`
3. Décrivez la ressource avec `kubectl describe`
4. Réinitialisez avec `kubectl delete all --all`

**Fait par: Khamis Amaboua** 
