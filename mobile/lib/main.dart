import 'package:flutter/material.dart';

void main() {
  runApp(const RescueApp());
}

class RescueApp extends StatelessWidget {
  const RescueApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rescue Priority Dashboard',
      theme: ThemeData(
        primarySwatch: Colors.red,
      ),
      home: const RescueDashboard(),
    );
  }
}

class RescueDashboard extends StatelessWidget {
  const RescueDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rescue Priority Dashboard'),
      ),
      body: ListView(
        children: const [
          ListTile(
            title: Text("Worker A"),
            subtitle: Text("Priority 1 • Survival Probability: 0.75"),
          ),
          ListTile(
            title: Text("Worker B"),
            subtitle: Text("Priority 2 • Survival Probability: 0.60"),
          ),
          ListTile(
            title: Text("Worker C"),
            subtitle: Text("Priority 3 • Survival Probability: 0.42"),
          ),
        ],
      ),
    );
  }
}
