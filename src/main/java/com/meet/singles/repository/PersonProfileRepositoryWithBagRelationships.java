package com.meet.singles.repository;

import com.meet.singles.domain.PersonProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface PersonProfileRepositoryWithBagRelationships {
    Optional<PersonProfile> fetchBagRelationships(Optional<PersonProfile> personProfile);

    List<PersonProfile> fetchBagRelationships(List<PersonProfile> personProfiles);

    Page<PersonProfile> fetchBagRelationships(Page<PersonProfile> personProfiles);
}
