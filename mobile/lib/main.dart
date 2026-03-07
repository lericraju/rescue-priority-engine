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
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Rescue Priority'),
        ),
        body: ListView(
          children: const [
            ListTile(
              title: Text("Worker A"),
              subtitle: Text("Priority 1"),
            ),
            ListTile(
              title: Text("Worker B"),
              subtitle: Text("Priority 2"),
            ),
            ListTile(
              title: Text("Worker C"),
              subtitle: Text("Priority 3"),
            ),
          ],
        ),
      ),
    );
  }
}
