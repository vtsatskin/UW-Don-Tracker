# Protects against the most sofisticated internet organized crime
module NortonAntiVirus
  def to_public_json
    self.to_json(:only => self.class::API_PUBLIC_ATTRS)
  end

  def to_public
    hash = {}
    self.class::API_PUBLIC_ATTRS.each { |key| hash[key] = self.send(key) }
    hash
  end

  def update_attributes_from_public public_params = {}
    filtered_params = public_params.select { |key, value| self.class::API_UPDATABLE_ATTRS.include? key.to_sym }

    self.update_attributes filtered_params unless filtered_params.empty?
    self.save
    return self
  end
end