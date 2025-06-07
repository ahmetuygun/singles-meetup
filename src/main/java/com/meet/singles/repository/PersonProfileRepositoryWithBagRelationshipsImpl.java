package com.meet.singles.repository;

import com.meet.singles.domain.PersonProfile;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class PersonProfileRepositoryWithBagRelationshipsImpl implements PersonProfileRepositoryWithBagRelationships {

    private static final String ID_PARAMETER = "id";
    private static final String PERSONPROFILES_PARAMETER = "personProfiles";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<PersonProfile> fetchBagRelationships(Optional<PersonProfile> personProfile) {
        return personProfile.map(this::fetchEvents);
    }

    @Override
    public Page<PersonProfile> fetchBagRelationships(Page<PersonProfile> personProfiles) {
        return new PageImpl<>(
            fetchBagRelationships(personProfiles.getContent()),
            personProfiles.getPageable(),
            personProfiles.getTotalElements()
        );
    }

    @Override
    public List<PersonProfile> fetchBagRelationships(List<PersonProfile> personProfiles) {
        return Optional.of(personProfiles).map(this::fetchEvents).orElse(Collections.emptyList());
    }

    PersonProfile fetchEvents(PersonProfile result) {
        return entityManager
            .createQuery(
                "select personProfile from PersonProfile personProfile left join fetch personProfile.events where personProfile.id = :id",
                PersonProfile.class
            )
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<PersonProfile> fetchEvents(List<PersonProfile> personProfiles) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, personProfiles.size()).forEach(index -> order.put(personProfiles.get(index).getId(), index));
        List<PersonProfile> result = entityManager
            .createQuery(
                "select personProfile from PersonProfile personProfile left join fetch personProfile.events where personProfile in :personProfiles",
                PersonProfile.class
            )
            .setParameter(PERSONPROFILES_PARAMETER, personProfiles)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
