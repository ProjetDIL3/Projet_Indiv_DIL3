import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../providers/details_provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/event_model.dart';

class DetailsScreen extends StatefulWidget {
  final String eventId;

  const DetailsScreen({super.key, required this.eventId});

  @override
  State<DetailsScreen> createState() => _DetailsScreenState();
}

class _DetailsScreenState extends State<DetailsScreen> {
  late EventDetailsProvider _detailsProvider;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<EventDetailsProvider>().loadEventDetails(widget.eventId);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _detailsProvider = Provider.of<EventDetailsProvider>(
      context,
      listen: false,
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        _detailsProvider.reset();
      }
    });
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorPrimary = const Color.fromARGB(255, 175, 62, 255);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 4,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Détails Événement',
          style: TextStyle(
            color: Color.fromARGB(255, 175, 62, 255),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      backgroundColor: Colors.grey[100],
      body: Consumer<EventDetailsProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Erreur: ${provider.error}',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      provider.loadEventDetails(widget.eventId);
                    },
                    child: const Text('Réessayer'),
                  ),
                ],
              ),
            );
          }

          if (provider.event == null) {
            return const Center(child: Text('Aucun événement trouvé'));
          }

          final event = provider.event!;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  color: Colors.white,
                  child: Text(
                    event.nom,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                ),

                _buildInfoSection('Informations', [
                  _buildInfoRow(
                    'Date',
                    DateFormat('dd/MM/yyyy à HH:mm').format(event.horodate),
                  ),
                  if (event.prix != null)
                    _buildInfoRow('Prix', '${event.prix} €'),
                  if (event.typeEvenement != null)
                    _buildInfoRow('Type', event.typeEvenement!),
                  if (event.description != null &&
                      event.description!.isNotEmpty)
                    _buildInfoRow(
                      'Description',
                      event.description!,
                      multiLine: true,
                    ),
                ], colorPrimary),

                if (event.idFormat.isNotEmpty)
                  _buildInfoSection('Format du tournoi', [
                    _buildInfoRow('Format', event.nomFormat ?? event.idFormat),
                    if (event.formatLink != null &&
                        event.formatLink!.isNotEmpty)
                      _buildInfoRow(
                        'Lien',
                        event.formatLink!,
                        isLink: true,
                        onLinkTap: () => _launchUrl(event.formatLink!),
                      ),
                  ], colorPrimary),

                if (event.idMagasin != null && event.idMagasin!.isNotEmpty)
                  _buildInfoSection('Lieu', [
                    if (event.magasinNom != null)
                      _buildInfoRow('Magasin', event.magasinNom!),
                    _buildAddressRow(event),
                    if (event.magasinTelephone != null &&
                        event.magasinTelephone!.isNotEmpty)
                      _buildInfoRow(
                        'Téléphone',
                        event.magasinTelephone!,
                        isLink: true,
                        onLinkTap:
                            () => _launchUrl('tel:${event.magasinTelephone}'),
                      ),
                    if (event.magasinSiteWeb != null &&
                        event.magasinSiteWeb!.isNotEmpty)
                      _buildInfoRow(
                        'Site web',
                        event.magasinSiteWeb!,
                        isLink: true,
                        onLinkTap: () => _launchUrl(event.magasinSiteWeb!),
                      ),
                  ], colorPrimary),

                _buildInfoSection('Contact', [
                  if (event.nomContact != null && event.nomContact!.isNotEmpty)
                    _buildInfoRow('Nom', event.nomContact!),
                  _buildInfoRow(
                    'Email',
                    event.email,
                    isLink: true,
                    onLinkTap: () => _launchUrl('mailto:${event.email}'),
                  ),
                ], colorPrimary),

                if (provider.address != null)
                  _buildInfoSection('Adresse', [
                    _buildInfoRow(
                      'Localisation',
                      provider.address!,
                      multiLine: true,
                    ),
                  ], colorPrimary),

                Container(
                  margin: const EdgeInsets.all(16.0),
                  height: 300,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey,
                        spreadRadius: 2,
                        blurRadius: 5,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: FlutterMap(
                      options: MapOptions(
                        initialCenter: LatLng(event.latitude, event.longitude),
                        initialZoom: 15,
                      ),
                      children: [
                        TileLayer(
                          urlTemplate:
                              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.example.magic_flutter',
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: LatLng(event.latitude, event.longitude),
                              width: 40,
                              height: 40,
                              child: const Icon(
                                Icons.location_on,
                                color: Colors.red,
                                size: 40,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    } else {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Impossible d\'ouvrir: $url')));
      }
    }
  }

  Widget _buildInfoSection(String title, List<Widget> children, Color color) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey,
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    String label,
    String value, {
    bool isLink = false,
    void Function()? onLinkTap,
    bool multiLine = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          isLink
              ? GestureDetector(
                onTap: onLinkTap,
                child: Text(
                  value,
                  style: const TextStyle(
                    color: Colors.blue,
                    decoration: TextDecoration.underline,
                    fontSize: 16,
                  ),
                ),
              )
              : Text(
                value,
                style: const TextStyle(fontSize: 16, color: Colors.black87),
                maxLines: multiLine ? null : 2,
                overflow: multiLine ? null : TextOverflow.ellipsis,
              ),
        ],
      ),
    );
  }

  Widget _buildAddressRow(MTGEvent event) {
    final addressParts = <String>[];

    if (event.numeroRue != null && event.numeroRue!.isNotEmpty) {
      addressParts.add(event.numeroRue!);
    }

    if (event.rue != null && event.rue!.isNotEmpty) {
      addressParts.add(event.rue!);
    }

    if (event.cp != null && event.cp!.isNotEmpty) {
      addressParts.add(event.cp!);
    }

    if (event.ville != null && event.ville!.isNotEmpty) {
      addressParts.add(event.ville!);
    }

    final address = addressParts.join(' ');

    return address.isNotEmpty
        ? _buildInfoRow('Adresse', address)
        : const SizedBox.shrink();
  }
}
