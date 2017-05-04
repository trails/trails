require 'yaml'
vconfig = YAML.load_file 'vconfig.yml'

Vagrant.configure("2") do |config|
  config.vm.define "dev"
  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "ops/playbooks/setup.yml"
    ansible.groups = {
      webservers: ["dev"],
      dbservers: ["dev"]
    }
    ansible.extra_vars = { config: vconfig }
  end
  config.vm.provider :virtualbox do |vb,override|
    override.vm.box = 'ubuntu/trusty32'
    config.vm.network "private_network", ip: '10.0.111.11', auto_config: false, adapter: 2, name: 'vboxnet1'
    vb.customize ["modifyvm", :id, "--nictype1", "Am79C973"]
    vb.customize ["modifyvm", :id, "--nictype2", "Am79C973"]
    config.vm.network "forwarded_port", guest: 80, host: 5080, auto_correct: true
    config.vm.network "forwarded_port", guest: 443, host: 5443, auto_correct: true
    config.vm.synced_folder './', '/vagrant', owner: 'www-data', group: 'www-data'
  end
end
