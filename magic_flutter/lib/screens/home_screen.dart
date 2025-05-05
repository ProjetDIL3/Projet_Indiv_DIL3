import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/events_provider.dart';
import '../utils/geocoding_service.dart';
import '../main.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with RouteAware {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  bool _isLoadingSearch = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<EventsProvider>().refresh();
      }
    });
    _scrollController.addListener(_onScroll);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    routeObserver.subscribe(this, ModalRoute.of(context)!);
  }
  
  @override
  void didPopNext() {
    if (mounted) {
      context.read<EventsProvider>().refresh();
    }
  }
  
  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.9) {
      context.read<EventsProvider>().loadEvents();
    }
  }

  void _handleSearch() async {
    final city = _searchController.text.trim();
    if (city.isEmpty) {
      context.read<EventsProvider>().clearCityFilter();
      return;
    }


    

    setState(() => _isLoadingSearch = true);
    await NominatimProxyService.delay();
    if (mounted) {
      await context.read<EventsProvider>().filterByCity(city);
    }

    setState(() => _isLoadingSearch = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        leadingWidth: 60,
        leading: Padding(
          padding: const EdgeInsets.only(left: 16.0),
          child: Image.asset('assets/images/logos.png', height: 40),
        ),
        title:
            _isSearching
                ? TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Rechercher par ville...',
                    hintStyle: const TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                    suffixIcon:
                        _isLoadingSearch
                            ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.grey,
                              ),
                            )
                            : IconButton(
                              icon: const Icon(Icons.clear, color: Colors.grey),
                              onPressed: () {
                                _searchController.clear();
                                context
                                    .read<EventsProvider>()
                                    .clearCityFilter();
                              },
                            ),
                  ),
                  style: const TextStyle(color: Colors.white),
                  textInputAction: TextInputAction.search,
                  onSubmitted: (_) => _handleSearch(),
                )
                : const Text(
                  'Magic The Gathering - Tournois',
                  style: TextStyle(
                    color: Color.fromARGB(255, 175, 62, 255),
                    fontWeight: FontWeight.bold,
                  ),
                ),
        actions: [
          if (!_isSearching)
            IconButton(
              onPressed: () {
                setState(() => _isSearching = true);
              },
              icon: const Icon(Icons.search, color: Colors.white),
            ),
          if (_isSearching)
            IconButton(
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _searchController.clear();
                });
                context.read<EventsProvider>().clearCityFilter();
              },
              icon: const Icon(Icons.cancel, color: Colors.white),
            ),
          IconButton(
            onPressed: () {
              Navigator.of(context).pushNamed('/login');
            },
            icon: const Icon(Icons.add, color: Colors.white),
          ),
          const SizedBox(width: 8),
        ],
        centerTitle: false,
        elevation: 4,
        toolbarHeight: 60,
      ),
      backgroundColor: const Color(0xFF2D2D2D),
      body: Consumer<EventsProvider>(
        builder: (context, provider, child) {
          if (provider.cityFilter.isNotEmpty &&
              provider.events.isEmpty &&
              !provider.isLoading) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Aucun événement trouvé pour cette ville',
                    style: TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      _searchController.clear();
                      provider.clearCityFilter();
                    },
                    child: const Text('Voir tous les événements'),
                  ),
                ],
              ),
            );
          }

          if (provider.events.isEmpty && !provider.isLoading) {
            return const Center(
              child: Text(
                'Aucun événement trouvé',
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          return Column(
            children: [
              if (provider.cityFilter.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      vertical: 6,
                      horizontal: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.purple.shade800,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Filtré par: ${provider.cityFilter}',
                          style: const TextStyle(color: Colors.white),
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.close,
                            size: 16,
                            color: Colors.white,
                          ),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () {
                            _searchController.clear();
                            provider.clearCityFilter();
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  itemCount:
                      provider.hasMore
                          ? provider.events.length + 1
                          : provider.events.length,
                  itemBuilder: (context, index) {
                    if (index >= provider.events.length) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(8.0),
                          child: CircularProgressIndicator(),
                        ),
                      );
                    }

                    final event = provider.events[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        vertical: 4,
                        horizontal: 8,
                      ),
                      color: const Color(0xFFF4F4F4),
                      child: InkWell(
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            '/details',
                            arguments: {'eventId': event.idEvenement},
                          );
                        },
                        splashColor: const Color.fromARGB(255, 123, 123, 123),
                        highlightColor: Colors.grey,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            vertical: 8,
                            horizontal: 16,
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: ClipOval(
                                  child: Image.asset(
                                    'assets/images/default.png',
                                    fit: BoxFit.cover,
                                    filterQuality: FilterQuality.high,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      event.nom,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        color: Color(0xFF2D2D2D),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    Text(
                                      "${event.horodate.day}/${event.horodate.month}/${event.horodate.year}",
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey,
                                      ),
                                    ),
                                    if (event.ville != null)
                                      Text(
                                        event.ville!,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const Icon(
                                Icons.arrow_forward_ios,
                                size: 16,
                                color: Colors.grey,
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

}
